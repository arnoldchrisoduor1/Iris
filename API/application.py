import os
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
from PIL import Image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Configuration
class Config:
    UPLOAD_FOLDER = 'uploads/'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Fruit classes to match your model
FRUIT_CLASSES = [
    'Apple', 'Banana', 'Carambola', 'Guava', 'Kiwi', 
    'Mango', 'Orange', 'Peach', 'Pear', 'Persimmon', 
    'Pitaya', 'Plum', 'Pomegranate', 'Tomatoes', 'Muskmelon'
]

# Create Flask app
application = Flask(__name__)
application.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# Load pre-trained Keras model
def load_model():
    global model
    model = tf.keras.models.load_model('./models/final_mobilenet_model.keras')
    print("Model loaded successfully!")

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

# Prediction route
@application.route('/predict', methods=['POST'])
def predict():
    # Check if image is present in request
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Validate file type
    if file and allowed_file(file.filename):
        # Secure filename and save
        filename = secure_filename(file.filename)
        filepath = os.path.join(application.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Preprocess image
            processed_image = preprocess_image(filepath)
            
            # Make prediction
            start_time = tf.timestamp()
            predictions = model.predict(processed_image)
            processing_time = tf.timestamp() - start_time
            
            # Get top prediction
            top_class_index = np.argmax(predictions[0])
            top_class = FRUIT_CLASSES[top_class_index]
            confidence = float(predictions[0][top_class_index])
            
            # Clean up uploaded file
            os.remove(filepath)
            
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
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'Invalid file type'}), 400

# Initialize model on startup
load_model()

if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0', port=5000)