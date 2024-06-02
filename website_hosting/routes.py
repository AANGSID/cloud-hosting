from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User, Website
from utils import save_website_files

auth = Blueprint('auth', __name__)
main = Blueprint('main', __name__)

@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify(message='User registered'), 201

@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify(message='Invalid credentials'), 401

@main.route('/upload', methods=['POST'])
@jwt_required()
def upload_website():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(message='User not found'), 404

    name = request.form.get('name')
    files = request.files.getlist('files')

    if not name or not files:
        return jsonify(message='Name and files are required'), 400

    website = Website(name=name, owner=user)
    db.session.add(website)
    db.session.commit()

    save_website_files(user.username, website.id, files)

    return jsonify(message='Website uploaded'), 201

@main.route('/websites', methods=['GET'])
@jwt_required()
def get_websites():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify(message='User not found'), 404

    websites = Website.query.filter_by(user_id=user_id).all()
    return jsonify(websites=[website.name for website in websites]), 200
