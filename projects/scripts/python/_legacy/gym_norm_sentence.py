
def normalize_sentence(text:str) -> str:
    '''Normalizes input text and returns it back as str.'''
    normalized_text = " ".join(text.strip().split())
    normalized_text = normalized_text[0].upper() + normalized_text[1:].lower()
    if not normalized_text.endswith("."):
        normalized_text += "."
    return normalized_text

def main():
    '''Main entry point for the script.'''
    print(normalize_sentence("   hELlo   wORLD   "))

if __name__ == "__main__":
    '''Guarding main entry point for the script.'''
    main()
