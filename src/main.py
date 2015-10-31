import argparse
from service.insert_errors import InsertErrorService

parser = argparse.ArgumentParser(
    description='Read an input text file and create as output: ' + \
                '\n1. text file with artificial mistakes inserted.' + \
                '\n2. answer key listing the mistakes inserted.')
parser.add_argument('-i', '--input', required=True,
                    help='the file path of the input text file')
parser.add_argument('-o', '--output', required=True,
                    help='the file path where the output text file ' + \
                         '(with mistakes) should be saved')
parser.add_argument('-a', '--answers', required=True,
                    help='the file path where the answer key text file ' + \
                         'should be saved')
args = parser.parse_args()


if __name__ == '__main__':
    error_service = InsertErrorService()
    with open(args.input, 'r') as input_file:
        input_text = input_file.read().replace('\n', ' ').strip()

    with open(args.output, 'w') as output_file:
        error_service.generate_possible_errors(input_text)
        output_text = error_service.add_errors(input_text)
        output_file.write(output_text)

    with open(args.answers, 'w') as answer_file:
        error_service.write_answer_key(answer_file)

    print 'success'
