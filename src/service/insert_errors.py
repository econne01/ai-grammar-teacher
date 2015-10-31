# Service class to artificially insert errors into a given block of text
# (aka, an article)
import random


class InsertErrorService(object):

    WORD_CONFUSION = {
        'its': ['its', 'it\'s'],
        'there': ['their', 'there', 'they\'re'],
        'to': ['to', 'too', 'two'],
        'your': ['your', 'you\'re']
    }
    ERROR_TOLERANCE = 0.5

    def __init__(self):
        self.possible_errors = []
        self.errors = []

    def add_errors(self, text):
        new_text = []
        for index, word in enumerate(text.strip().split()):
            new_word = word
            for error in self.possible_errors:
                if error['word_index'] == index:
                    is_selected = random.random() >= self.ERROR_TOLERANCE
                    if is_selected:
                        print 'Got an error!'
                        new_word = error['mistake']
                        self.errors.append(error)
                        break
            new_text.append(new_word)
        return ' '.join(new_text)

    def generate_possible_errors(self, text):
        for index, word in enumerate(text.strip().split()):
            for confused_words in self.WORD_CONFUSION.values():
                if word.lower() in confused_words:
                    new_text = random.choice([w for w in confused_words if w != word.lower()])
                    error = self._generate_error(index, word, new_text, 'WORD SWAP')
                    self.possible_errors.append(error)
        print self.possible_errors

    def write_answer_key(self, answer_file):
        """
        @param File answer_file. The file location where answers will be written
        """
        answer_file.write('Total Errors: ' + '\n')
        answer_file.write('\t'.join(['Count', 'Original Text', 'Mistake Text', 'Error Type']))
        answer_file.write('\n')
        for index, err in enumerate(self.errors):
            answer_file.write('\t'.join([
                str(err['word_index']).zfill(2),
                err['original'],
                err['mistake'],
                err['type']
            ]))
            answer_file.write('\n')

    def _generate_error(self, word_index, original_text, new_text, error_type):
        error = {}
        error['word_index'] = word_index
        error['original'] = original_text
        error['mistake'] = new_text
        error['type'] = error_type
        return error
