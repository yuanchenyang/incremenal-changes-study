from flask import Flask, request
app = Flask(__name__)

@app.route('/save_data', methods=["POST"])
def save_data():
    with open("results.txt", "a") as myfile:
        myfile.write(request.data + "\n")
    return "Complete"

@app.route('/start_new_session', methods=["POST"])
def start_new_session():
    """Start a new session, providing a URL and an unique ID.
    """
    a = request.args
    url = a.get("url", "no_url")
    with open(get_filename(a), "w") as myfile:
        myfile.write(url + "\n")
        myfile.write(request.data+ "\n")
    return "Complete"

@app.route('/record_mutation', methods=["POST"])
def record_mutation():
    """Records a new mutation for an existing session
    """
    with open(get_filename(request.args), "a") as myfile:
        myfile.write(request.data + "\n")
    return "Complete"

def get_filename(args):
    return "data/{}.txt".format(args.get("id", "no_id"))

if __name__ == '__main__':
    app.run(port=6666, debug=True)
