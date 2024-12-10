import { div } from '../../scripts/dom-helpers.js';
import {
  loadScript,
  loadCSS,
  readBlockConfig,
  getMetadata,
} from '../../scripts/aem.js';

export default async function decorate(block) {
  block.closest('.section').classList.add('calcite-mode-dark', 'dark');
  block.classList.add('calcite-mode-dark', 'dark');
  const config = readBlockConfig(block);
  const divId = getMetadata('formdivid') || config.divId;
  config.divId = divId;

  block.replaceChildren(div({ id: divId }));

  await Promise.all([
    loadCSS('https://webapps-cdn.esri.com/CDN/one-form/one-form.css'),
    loadScript('https://webapps-cdn.esri.com/CDN/one-form/one-form.js'),
  ]);

  config.aemEditMode = false;

  const baseFormProps = {
    divId,
    aemFieldServiceBasePath: 'https://assets.esri.com/content/experience-fragments/esri-sites/en-us/site-settings/one-form-admin/master',
    aemEditMode: 'false',
    mode: 'basic-progressive-form',
    formOpensInAModal: '',
    modalTitle: '',
    leftAligned: '',
    darkMode: true, // metadata.mode === 'dark',
    transparentBackground: '',
    pardotHandler: 'https://go.esri.com/l/82202/2022-05-31/pnykw9',
    organicSfId: '7015x000001PKGoAAO',
    isolation: '',
    disablePersonalization: '' === 'true',
    inlineThankYouPage: '',
    thankYouBannerImage: '',
    thankYouAssetTitle: '',
    thankYouAssetType: 'Brochure',
    thankYouAssetPath: '',
    thankYouListName: '',
    thankYouHeader: '',
    thankYouMessage: '',
    mqlComment: 'Please review the \x27What Prompted Your Interest?\x27 field for follow up.',
    mqlBehavior: null,
    mqlFormHandler: '',
    gdprMode: config.gdprMode,
    showEventConsentCheckBoxes: '' === 'true',
    marketingConsentRequired: '',
    marketingConsentRequiredMessage: '',
    customMarketingConsentLabel: '',
    customMarketingConsentRequiredMessage: '',
    customContactConsentLabel: '',
    customContactConsentRequiredMessage: '',
    customFormConfig: config.customFormConfig,
    thankyouPageUrl: '',
    thankyouPageParams: '',
    sendEmail: '' === 'true',
    emailTo: '',
    emailCc: '',
    emailBcc: '',
    emailSubject: '',
    emailBody: '',
  };
  // merge config and baseFormProps
  const formProps = { ...baseFormProps, ...config };

  window.initOneForm(divId, formProps);
}
