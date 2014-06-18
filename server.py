from flask import Flask, request
app = Flask(__name__)

@app.route('/save_data', methods=["POST"])
def save_data():
    with open("results.txt", "a") as myfile:
        myfile.write(request.data + "\n")
    return "Complete"

if __name__ == '__main__':
    app.run(port=6666, debug=True)
