import { div, a } from '../../scripts/dom-helpers.js';
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
  const divId = getMetadata('formdivid') || config.divid;
  config.divid = divId;

  const formDiv = div({
    id: divId,
    class: 'one-form',
  });
  if (block.classList.contains('card-modal')) {
    delete config.cardcontent;
    // we need to find it "again" because the html is not preserved in readBlockConfig
    const cardContent = [...block.querySelectorAll(':scope > div')]
      .find((el) => el.firstElementChild.textContent === 'cardContent')
      .lastElementChild;
    const cardModalContent = a({ class: 'card-modal-content' }, cardContent);
    cardModalContent.addEventListener('click', () => {
      block.classList.add('modal-active');
      window.openOneFormModal();
    });
    block.replaceChildren(
      formDiv,
      cardModalContent,
    );
  } else {
    block.replaceChildren(formDiv);
  }

  // TODO get card if modals

  await Promise.all([
    loadCSS('https://webapps-cdn.esri.com/CDN/one-form/one-form.css'),
    loadScript('https://webapps-cdn.esri.com/CDN/one-form/one-form.js'),
  ]);

  config.aemEditMode = false;

  const baseFormProps = {
    aemFieldServiceBasePath: 'https://assets.esri.com/content/experience-fragments/esri-sites/en-us/site-settings/one-form-admin/master',
    aemEditMode: 'false',
    mode: 'basic-progressive-form',
    formOpensInAModal: 'true',
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

  console.log('formProps', formProps);

  // const form = window.oneForm.attachToForm(divId);
  // form.on('load', (formApi) => {
  //   //Perform API actions here
  //   console.log('form loaded');
  // });

  // workaround for initOneForm requiring the form div to be in the DOM,
  // which it is not when loaded as a fragment
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'childlist') {
        console.log('A child node has been added or removed.', document.getElementById(divId));
      }
      if (mutation.type === 'childList' && document.getElementById(divId)) {
        const initResult = window.initOneForm(divId, formProps);
        console.log('init result', initResult);
        observer.disconnect();
      }
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
