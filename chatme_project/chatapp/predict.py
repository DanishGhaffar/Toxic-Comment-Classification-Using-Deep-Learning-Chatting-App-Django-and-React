import tensorflow as tf
from transformers import BertTokenizer

# Load the SavedModel
model = tf.saved_model.load(r'model\bert_toxic_comment_classifier')

infer = model.signatures['serving_default']

# Initialize the tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def predict_toxicity(comment):
    # Tokenize the input comment
    encodings = tokenizer(
        [comment],  # Wrap comment in a list
        padding=True,
        truncation=True,
        max_length=128,
        return_tensors="tf"
    )
    
    # Prepare inputs for the model
    inputs = {
        'input_ids': encodings['input_ids'],
        'attention_mask': encodings['attention_mask'],
        'token_type_ids': encodings.get('token_type_ids', tf.zeros_like(encodings['input_ids']))  # Use zeros if not provided
    }

    # Make predictions using the model
    logits = infer(**inputs)['logits']
    
    # Apply sigmoid to get probabilities
    probabilities = tf.sigmoid(logits).numpy()
    
    # Define the labels corresponding to the classes
    labels = ['toxic', 'severe_toxic', 'obscene', 'identity_hate', 'threat', 'insult']
    
    # Define indices to skip toxic class
    toxic_class_index = labels.index('toxic')
    non_toxic_class_indices = [i for i in range(len(labels)) if i != toxic_class_index]
    non_toxic_labels = [labels[i] for i in non_toxic_class_indices]
    
    # Extract non-toxic probabilities
    non_toxic_probabilities = [probabilities[0][j] for j in non_toxic_class_indices]
    
    if max(non_toxic_probabilities) > 0.5:  # Use a threshold to determine if a class should be considered
        # Find the index of the highest probability in the non-toxic classes
        best_non_toxic_index = non_toxic_probabilities.index(max(non_toxic_probabilities))
        best_non_toxic_label = non_toxic_labels[best_non_toxic_index]
        return best_non_toxic_label
    else:
        # If no non-toxic class has a high probability, classify as non-toxic
        return 'non-toxic'

# Example usage
print(predict_toxicity("you are idiot"))

print(predict_toxicity("you bloody americans"))
print(predict_toxicity("fuck off"))

print(predict_toxicity("you bitch"))

print(predict_toxicity("you are cute"))