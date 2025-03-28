import os
import boto3
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Configuration class
class Config:
    UPLOAD_FOLDER = 'uploads/'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
    S3_BUCKET = 'iris-ai-models'
    MODEL_KEY = 'models/final_mobilenet_model.keras'
    LOCAL_MODEL_PATH = './models/final_mobilenet_model.keras'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size

# Create Flask app
application = Flask(__name__)
CORS(application)  # Enable CORS for all routes

# Configure max file upload size
application.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
application.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

# Ensure upload and models directories exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs('./models', exist_ok=True)

FRUIT_CLASSES = [
    'Apple', 'Banana', 'Carambola', 'Guava', 'Kiwi', 
    'Mango', 'Orange', 'Peach', 'Pear', 'Persimmon', 
    'Pitaya', 'Plum', 'Pomegranate', 'Tomatoes', 'Muskmelon'
]


# Download model from S3
def download_model_from_s3():
    try:
        # Create S3 client
        s3 = boto3.client('s3')
        
        # Download the model file
        s3.download_file(
            Config.S3_BUCKET, 
            Config.MODEL_KEY, 
            Config.LOCAL_MODEL_PATH
        )
        print("Model downloaded successfully from S3!")
        return True
    except Exception as e:
        print(f"Error downloading model from S3: {e}")
        return False

# Load pre-trained Keras model
def load_model():
    global model
    try:
        # Ensure model is downloaded
        if not os.path.exists(Config.LOCAL_MODEL_PATH):
            if not download_model_from_s3():
                raise Exception("Could not download model from S3")
        
        # Load model
        model = tf.keras.models.load_model(Config.LOCAL_MODEL_PATH)
        print("Model loaded successfully!")
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

# Preprocess image for model prediction
def preprocess_image(image_path):
    # Open and resize image
    img = Image.open(image_path)
    img = img.resize((224, 224))  # Resize to match model's expected input
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Use MobileNetV2 preprocessing function
    img_array = preprocess_input(img_array)
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

# Check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

# Home page with upload form
@application.route('/', methods=['GET'])
def upload_form():
    return render_template('upload.html', fruit_classes=FRUIT_CLASSES)

@application.route('/predict', methods=['POST'])
def predict():
    # Check if image is present in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Check file size before saving
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)  # Reset file pointer
    
    # Log file size and check against limit
    print(f"Uploaded file size: {file_size} bytes")
    if file_size > application.config['MAX_CONTENT_LENGTH']:
        return jsonify({
            'error': f'File too large. Maximum size is {application.config["MAX_CONTENT_LENGTH"] / (1024*1024)} MB',
            'actual_size': file_size
        }), 413  # Payload Too Large status code
    
    # Validate file type
    print("Validating filename")
    if file and allowed_file(file.filename):
        # Secure filename and save
        filename = secure_filename(file.filename)
        filepath = os.path.join(application.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"filename validated: {filename}")
        
        try:
            # Preprocess image
            print("Processing Image")
            processed_image = preprocess_image(filepath)
            
            print("getting predictions")
            # Make prediction
            start_time = tf.timestamp()
            print("prediction start....")
            predictions = model.predict(processed_image)
            print("received prediction, getting top class")
            processing_time = tf.timestamp() - start_time
            
            # Get top prediction
            top_class_index = np.argmax(predictions[0])
            print(f"top class index: {top_class_index}")
            top_class = FRUIT_CLASSES[top_class_index]
            print(f"Top class {top_class}")
            confidence = float(predictions[0][top_class_index])
            print(f"confidence: {confidence}")
            
            # Clean up uploaded file
            print("removing uploaded file...")
            os.remove(filepath)
            print(f"Returning predictions :::: >>>> {top_class}")
            
            return jsonify({
                'success': True,
                'prediction': {
                    'class': top_class,
                    'confidence': round(confidence, 4),
                    'processingTime': round(processing_time.numpy(), 2)
                }
            })
        
        except Exception as e:
            # Clean up file in case of error
            print(f"an error occured in processing and prediction{str(e)}")
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

# Initialize model on startup
load_model()

if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0', port=5000)