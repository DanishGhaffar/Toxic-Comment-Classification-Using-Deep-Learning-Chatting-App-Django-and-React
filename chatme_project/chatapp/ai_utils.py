# chatapp/ai_utils.py

def predict_toxicity(content):
    # Load your pre-trained model here and make predictions.
    # For demonstration purposes, we'll simulate with a simple rule.
    toxic_keywords = ['badword1', 'badword2', 'badword3']
    for word in toxic_keywords:
        if word in content.lower():
            return True
    return False
