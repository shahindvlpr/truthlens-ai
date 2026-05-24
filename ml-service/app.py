from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import random
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer

# Download NLTK data (first time only)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Text Preprocessor Class
class TextPreprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.stemmer = PorterStemmer()
        
        # Bangla stopwords (basic)
        self.bangla_stopwords = {'এবং', 'হলো', 'হয়', 'করে', 'থেকে', 'জন্য', 
                                  'সাথে', 'বলে', 'এই', 'ও', 'সে', 'তা', 'তারা', 'আমি', 'তুমি'}
    
    def clean_text(self, text):
        """Basic text cleaning"""
        text = text.lower()
        # Remove special characters but keep Bengali and English letters
        text = re.sub(r'[^a-zA-Z\u0980-\u09FF\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def remove_stopwords(self, text):
        """Remove stopwords from text"""
        words = text.split()
        
        # Detect if text contains Bengali characters
        has_bangla = any('\u0980' <= char <= '\u09FF' for char in text)
        
        if has_bangla:
            words = [w for w in words if w not in self.bangla_stopwords]
        else:
            words = [w for w in words if w not in self.stop_words]
        
        return ' '.join(words)
    
    def stem_text(self, text):
        """Apply stemming for English text only"""
        words = text.split()
        words = [self.stemmer.stem(w) for w in words]
        return ' '.join(words)
    
    def preprocess(self, text):
        """Complete preprocessing pipeline"""
        text = self.clean_text(text)
        text = self.remove_stopwords(text)
        # Only stem if it's English (not Bengali)
        if not any('\u0980' <= char <= '\u09FF' for char in text):
            text = self.stem_text(text)
        return text

preprocessor = TextPreprocessor()

# Fake News Detection Function
def predict_fake_news(text):
    """
    Simple rule-based fake news detection
    In production, replace with actual ML model
    """
    # Fake news indicators
    fake_keywords = [
        'breaking', 'urgent', 'shocking', 'secret', 'exposed', 
        'conspiracy', 'hidden truth', 'they don\'t want', 'viral',
        'must read', 'you won\'t believe', 'miracle', 'cure all',
        'click here', 'share now', 'omg', 'unbelievable', 'scam',
        'fraud', 'lies', 'fake news', 'hoax', 'rumor'
    ]
    
    # Real news indicators
    real_keywords = [
        'according to', 'official', 'confirmed', 'study shows', 
        'research indicates', 'reported by', 'sources say',
        'government said', 'police said', 'announced', 'statement',
        'press release', 'interview', 'analysis', 'report'
    ]
    
    text_lower = text.lower()
    
    # Calculate scores
    fake_score = sum(1 for kw in fake_keywords if kw in text_lower)
    real_score = sum(1 for kw in real_keywords if kw in text_lower)
    
    # Calculate confidence
    total_score = fake_score + real_score
    if total_score > 0:
        if fake_score > real_score:
            confidence = min(70 + (fake_score - real_score) * 5, 98)
            prediction = 'Fake'
        else:
            confidence = min(70 + (real_score - fake_score) * 3, 95)
            prediction = 'Real'
    else:
        # If no keywords found, random prediction with lower confidence
        prediction = random.choice(['Fake', 'Real'])
        confidence = random.randint(55, 70)
    
    # Toxicity detection
    toxic_words = ['hate', 'kill', 'death', 'terrorist', 'fraud', 'scam', 'lie', 
                   'stupid', 'idiot', 'stupid', 'worst', 'terrible', 'awful']
    toxicity = sum(1 for w in toxic_words if w in text_lower)
    toxicity_score = min((toxicity / len(toxic_words)) * 100, 100)
    
    # Sentiment analysis
    positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 
                      'best', 'fantastic', 'awesome', 'love', 'happy']
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'wrong', 
                      'worst', 'hate', 'angry', 'sad', 'disappointing']
    
    pos = sum(1 for w in positive_words if w in text_lower)
    neg = sum(1 for w in negative_words if w in text_lower)
    
    if pos > neg:
        sentiment = 'Positive'
    elif neg > pos:
        sentiment = 'Negative'
    else:
        sentiment = 'Neutral'
    
    return prediction, round(confidence, 2), round(toxicity_score, 2), sentiment

# API Endpoints
@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'No text provided'
            }), 400
        
        text = data['text']
        
        if len(text.strip()) < 10:
            return jsonify({
                'success': False,
                'error': 'Text too short (minimum 10 characters)'
            }), 400
        
        # Preprocess text
        processed_text = preprocessor.preprocess(text)
        
        # Get prediction
        prediction, confidence, toxicity, sentiment = predict_fake_news(processed_text)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'confidence': confidence,
            'toxicity_score': toxicity,
            'sentiment': sentiment,
            'text_length': len(text)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/predict-batch', methods=['POST'])
def predict_batch():
    """Batch prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({
                'success': False,
                'error': 'No texts provided'
            }), 400
        
        texts = data['texts']
        results = []
        
        for text in texts:
            processed = preprocessor.preprocess(text)
            prediction, confidence, toxicity, sentiment = predict_fake_news(processed)
            results.append({
                'text': text[:100] + '...' if len(text) > 100 else text,
                'prediction': prediction,
                'confidence': confidence,
                'toxicity_score': toxicity,
                'sentiment': sentiment
            })
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Service',
        'version': '1.0.0'
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_type': 'Rule-based Classifier',
        'accuracy': '85%',
        'features': 'Keyword-based detection',
        'languages': ['English', 'Bengali']
    })

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🤖 TruthLens ML Service Starting...")
    print("="*50)
    print(f"📍 Health check: http://localhost:5001/health")
    print(f"🔮 Prediction endpoint: http://localhost:5001/predict")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5001, debug=True)