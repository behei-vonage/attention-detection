# Attention Detection Sample App

A simple demo app leveraging Vonage Video API's and TesnorFlow's MediaPipe Facemesh library to generate and display Attention Detection metrics.

## Requirments
1. Vonage API Key and Secret
2. Node 8.6.2+
3. npm, The Node Package Manager

To setup the app on your machine first clone the repo:

`git clone https://github.com/hamzanasir/attention-detection.git`

If you have NVM (Node Version Manager) please set your node to the correct version using:

`nvm use`

Now install the dependencies needed for the application:

`npm install`

Now we need to setup our Vonage API Key and Secret. Let’s start off by copying the env template:

`cp .envcopy .env`

Now all you need to do is replace the api key and secret in the .env file to your credentials. You can find your API Key and Secret on the project page of your Vonage Video API Account (https://tokbox.com/account).

Your .env file should look like this:

```
# enter your TokBox api key after the '=' sign below
TOKBOX_API_KEY=your_api_key

# enter your TokBox api secret after the '=' sign below
TOKBOX_SECRET=your_project_secret
```

