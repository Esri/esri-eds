# Adobe Edge for Esri Digital Experience

This project leverages Adobe Edge to build and deploy websites. By utilizing Adobe Edge's capabilities, we aim to create engaging and dynamic content that effectively showcases Esri's products and services. 

## Environments
- Preview: https://main--esri-eds--esri.aem.page/
- Live: https://main--esri-eds--esri.aem.live/

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `esri` directory in your favorite IDE and start coding :)
