# Attention Detection Sample App

A simple demo app that is leveraging Vonage Video API and TensorFlow MediaPipe Facemesh library to generate and display human pose.

## Requirments
1. Vonage API Key and Secret
2. Node 8.6.2+
3. npm, The Node Package Manager

To run the app on your machine first clone the repo:

`git clone https://github.com/behei-vonage/pose-detection.git`

If you have NVM (Node Version Manager) please set your node to the correct version using:

`nvm use`

Now install the dependencies needed for the application:

`npm install`

Now we need to set our Vonage API Key and Secret. Let’s start by copying the env template:

`cp .envcopy .env`

Now all you need to do is replace the API key and secret in the .env file with your credentials. You can find your API Key and Secret on the project page of your Vonage Video API Account (https://tokbox.com/account).

Your .env file should look like this:

```
# enter your TokBox API key after the '=' sign below
TOKBOX_API_KEY=your_api_key

# enter your TokBox API secret after the '=' sign below
TOKBOX_SECRET=your_project_secret
```

To start the application, run the following:

`npm start`

