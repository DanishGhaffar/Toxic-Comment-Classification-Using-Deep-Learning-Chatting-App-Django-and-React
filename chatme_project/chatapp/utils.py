# your_app_name/utils.py
"""
def predict_toxicity(message_content):
    
    Predicts toxicity of a message.
    Returns the toxicity type if toxic, else None.
    Example Output: 'toxic', 'severe_toxic', 'obscene', etc.
    
    # Replace this with your actual implementation
    # For demonstration, returning dummy data based on content
    import random
    toxicity_types = ['toxic', 'severe_toxic', 'obscene', 'threat', 'insult', 'identity_hate']
    # Simple random flagging for demonstration
    
    return random.choice(toxicity_types)
"""

import pandas as pd
from transformers import BertTokenizer
from nltk.corpus import stopwords
import string
import nltk



# Initialize NLTK stopwords
nltk.download('stopwords')
stop_words = set(stopwords.words('english'))

# Initialize the BERT tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

def preprocess_text(text):
    try:
        # Lowercase the text
        text = text.lower()
        
        # Remove special characters and punctuation
        text = ''.join(e for e in text if e.isalnum() or e.isspace())
        
        # Tokenize the text with BERT tokenizer
        inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=128)
        tokens = tokenizer.convert_ids_to_tokens(inputs['input_ids'][0])
        
        # Remove NLTK stopwords and BERT special tokens
        preprocessed_tokens = [token for token in tokens if token.lower() not in stop_words and token not in ['[CLS]', '[SEP]']]
        
        # Join tokens back into a string
        preprocessed_text = ' '.join(preprocessed_tokens).replace(' ##', '').strip()
        
        return preprocessed_text
    except Exception as e:
        raise ValueError(f"Error preprocessing text: {e}")


import nltk
from nltk.corpus import wordnet
import pandas as pd
import string

# Ensure WordNet is downloaded
nltk.download('wordnet')

# Load the toxic words file
file_path = r'media\BERT_MODEL_DATA_TOXIC_WORDS.xlsx'
df = pd.read_excel(file_path)

# Extract the toxic words from the DataFrame
toxic_words = df['comments_text'].str.lower().tolist()  # Convert toxic words to lowercase for case-insensitive matching

# Debugging: Print the toxic words list
print("Toxic words loaded:", toxic_words)

# Function to find antonyms for a word
def get_antonym(word):
    antonyms = []
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            if lemma.antonyms():
                antonyms.append(lemma.antonyms()[0].name())
    # Debugging: Print whether an antonym was found or not
    print(f"Word: {word}, Antonym found: {antonyms[0] if antonyms else 'None'}")
    return antonyms[0] if antonyms else word  # Return the word itself if no antonym found

# Function to clean text (remove punctuation and make lowercase)
def clean_word(word):
    return word.strip(string.punctuation).lower()

# Function to replace toxic words with their antonyms
def replace_toxic_with_antonyms(text, toxic_words):
    words = text.split()  # Split text into individual words
    for i, word in enumerate(words):
        clean_word_check = clean_word(word)  # Clean the word to remove punctuation and make lowercase
        # Debugging: Print each word and whether it is considered toxic
        print(f"Checking word: {clean_word_check}")
        if clean_word_check in toxic_words:
            antonym = get_antonym(clean_word_check)
            words[i] = antonym  # Replace toxic word with its antonym
            # Debugging: Print the replacement
            print(f"Replaced '{clean_word_check}' with '{antonym}'")
    return ' '.join(words)  # Rejoin the words into a single string

# Example usage with the toxic words from your file
text = "You are an idiot and a fornicator."

cleaned_text = replace_toxic_with_antonyms(text, toxic_words)

# Debugging: Print the final cleaned text
print("Final cleaned text:", cleaned_text)

