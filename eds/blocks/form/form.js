import { div, a, p } from '../../scripts/dom-helpers.js';
import {
  loadScript,
  loadCSS,
  readBlockConfig,
  getMetadata, buildBlock, loadBlock, decorateBlock,
} from '../../scripts/aem.js';

function getFormProps(config) {
  const baseFormProps = {
    aemFieldServiceBasePath: 'https://assets.esri.com/content/experience-fragments/esri-sites/en-us/site-settings/one-form-admin/master',
    aemEditMode: 'false',
    mode: 'basic-progressive-form',
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
  const formProps = { ...baseFormProps, ...config };
  return formProps;
}

export default async function decorate(block) {
  block.closest('.section').classList.add('calcite-mode-dark', 'dark');
  block.classList.add('calcite-mode-dark', 'dark');
  const config = readBlockConfig(block);
  const divId = getMetadata('formdivid') || config.divid;
  config.divid = divId;

  const isModal = block.classList.contains('card-modal');

  if (isModal) {
    config.formOpensInAModal = 'true';
    // modalTitle: '',
  }

  const formProps = getFormProps(config);

  const loadOneForm = Promise.all([
    loadCSS('https://webapps-cdn.esri.com/CDN/one-form/one-form.css'),
    loadScript('https://webapps-cdn.esri.com/CDN/one-form/one-form.js'),
  ]);
  const formDiv = div({
    id: divId,
    class: 'one-form',
  });
  if (isModal) {
    delete config.cardcontent;
    // we need to find it "again" because the html is not preserved in readBlockConfig
    const cardContent = [...block.querySelectorAll(':scope > div')]
      .find((el) => el.firstElementChild.textContent === 'cardContent')
      .lastElementChild;

    const cardLink = a('Open form');
    cardLink.addEventListener('click', () => {
      window.openOneFormModal();
    });

    cardContent.prepend(cardLink);
    const newCardContent = div(
      ...[...cardContent.children].map((el) => p(el)),
    );
    const cardsBlock = buildBlock('cards', [[newCardContent]], ['simple']);

    block.replaceChildren(
      formDiv,
      cardsBlock,
    );
    decorateBlock(cardsBlock);
    await loadBlock(cardsBlock);
  } else {
    block.replaceChildren(formDiv);
  }

  loadOneForm.then(() => {
    if (document.getElementById(divId)) {
      window.initOneForm(divId, formProps);
    } else { // it is being loaded on a fragment
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === 'childList' && document.getElementById(divId)) {
            window.initOneForm(divId, formProps);
            observer.disconnect();
          }
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  });
}
