"""
ML Service Main Entry Point
Flask API server wrapping the existing ML prediction code
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys

# Add app directory to path
sys.path.insert(0, os.path.dirname(__file__))

from config.settings import settings
from app.services.predictor import PredictorService
from app.services.trainer import TrainerService
from app.core.model_manager import ModelManager

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize services
model_manager = ModelManager(models_dir=settings.models_dir)
predictor_service = PredictorService(model_manager=model_manager)
trainer_service = TrainerService(model_manager=model_manager)


# ============ Health Endpoints ============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for container orchestration"""
    return jsonify({
        'status': 'healthy',
        'service': settings.app_name,
        'version': settings.app_version,
        'environment': settings.environment,
        'models_loaded': model_manager.get_cached_count(),
        'models_available': model_manager.list_available_models()
    })


@app.route('/health', methods=['GET'])
def simple_health():
    """Simple health check"""
    return jsonify({'status': 'ok'})


@app.route('/ready', methods=['GET'])
def readiness_check():
    """Readiness probe"""
    is_ready = model_manager.is_ready()
    status_code = 200 if is_ready else 503
    return jsonify({
        'ready': is_ready,
        'models_dir_exists': os.path.exists(settings.models_dir)
    }), status_code


# ============ Prediction Endpoints ============

@app.route('/api/predict/<ticker>', methods=['GET'])
def predict(ticker):
    """
    Get 30-day price prediction for a stock

    Args:
        ticker: Stock symbol (e.g., AAPL, MSFT)
        days: Number of days to predict (query param, default: 30)

    Returns:
        JSON with predictions, metrics, and historical data
    """
    ticker = ticker.upper()
    days = request.args.get('days', 30, type=int)

    try:
        result = predictor_service.predict(ticker, days)

        if result is None:
            return jsonify({
                'error': f'Unable to generate predictions for {ticker}',
                'message': 'Error fetching stock data or creating model'
            }), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': f'Prediction failed for {ticker}',
            'message': str(e)
        }), 500


# ============ Model Management Endpoints ============

@app.route('/api/models', methods=['GET'])
def list_models():
    """List available pre-trained models"""
    return jsonify({
        'pretrained_models': model_manager.list_available_models(),
        'cached_models': model_manager.list_cached_models()
    })


@app.route('/api/train/<ticker>', methods=['POST'])
def train_model(ticker):
    """
    Train a new model for a specific ticker

    Args:
        ticker: Stock symbol to train model for

    Returns:
        Training result with metrics
    """
    ticker = ticker.upper()

    try:
        result = trainer_service.train(ticker)

        if result is None:
            return jsonify({
                'error': f'Unable to train model for {ticker}'
            }), 400

        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': f'Training failed for {ticker}',
            'message': str(e)
        }), 500


@app.route('/api/models/<ticker>', methods=['DELETE'])
def delete_model(ticker):
    """Delete a trained model"""
    ticker = ticker.upper()

    try:
        model_manager.delete_model(ticker)
        return jsonify({
            'message': f'Model for {ticker} deleted successfully'
        })
    except Exception as e:
        return jsonify({
            'error': f'Failed to delete model for {ticker}',
            'message': str(e)
        }), 500


# ============ Application Entry Point ============

if __name__ == '__main__':
    # Ensure models directory exists
    os.makedirs(settings.models_dir, exist_ok=True)

    print(f"Starting {settings.app_name} v{settings.app_version}")
    print(f"Environment: {settings.environment}")
    print(f"Models directory: {settings.models_dir}")

    # Pre-load existing models
    model_manager.preload_models()

    app.run(
        host=settings.host,
        port=settings.port,
        debug=settings.debug
    )
