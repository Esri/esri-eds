import { div } from '../../scripts/dom-helpers.js';
import { loadScript, loadCSS } from '../../scripts/aem.js';

export default async function decorate(block) {
  const divId = 'one-form-target-div';

  block.appendChild(div({ id: divId }));

  const section = document.querySelector('.form-container');
  const metadata = {
    mode: section.getAttribute('data-mode'),
    formName: section.getAttribute('data-form-name'),
    thankYouFormType: section.getAttribute('data-thank-you-form-type'),
    customFormConfig: section.getAttribute('data-custom-form-config'),
    mqlBehavior: section.getAttribute('data-mql-behavior'),
    gdprMode: section.getAttribute('data-gdpr-mode'),
  };

  const calciteModeClassName = metadata.mode === 'dark' ? 'calcite-mode-dark' : 'calcite-mode-light';
  block.classList.add(calciteModeClassName);
  section.classList.add(calciteModeClassName);

  await Promise.all([
    loadCSS('https://webapps-cdn.esri.com/CDN/one-form/one-form.css'),
    loadScript('https://webapps-cdn.esri.com/CDN/one-form/one-form.js'),
  ]);

  const formProps = {
    divId,
    aemFieldServiceBasePath: '/content/experience\u002Dfragments/esri\u002Dsites/en\u002Dus/site\u002Dsettings/one\u002Dform\u002Dadmin/master',
    aemEditMode: 'false',
    mode: 'basic-progressive-form',
    formName: metadata.formName,
    formOpensInAModal: '',
    modalTitle: '',
    formModalLookup: metadata.formName,
    leftAligned: '',
    darkMode: metadata.mode === 'dark',
    transparentBackground: '',
    pardotHandler: 'https://go.esri.com/l/82202/2022\u002D05\u002D31/pnykw9',
    organicSfId: '7015x000001PKGoAAO',
    isolation: '',
    disablePersonalization: '' === 'true',
    inlineThankYouPage: '',
    thankYouFormType: metadata.thankYouFormType,
    thankYouBannerImage: '',
    thankYouAssetTitle: '',
    thankYouAssetType: 'Brochure',
    thankYouAssetPath: '',
    thankYouListName: '',
    thankYouHeader: '',
    thankYouMessage: '',
    mqlComment: 'Please review the \x27What Prompted Your Interest?\x27 field for follow up.',
    mqlBehavior: metadata.mqlBehavior,
    mqlFormHandler: '',
    gdprMode: metadata.gdprMode,
    showEventConsentCheckBoxes: '' === 'true',
    marketingConsentRequired: '',
    marketingConsentRequiredMessage: '',
    customMarketingConsentLabel: '',
    customMarketingConsentRequiredMessage: '',
    customContactConsentLabel: '',
    customContactConsentRequiredMessage: '',
    customFormConfig: metadata.customFormConfig,
    thankyouPageUrl: '',
    thankyouPageParams: '',
    sendEmail: '' === 'true',
    emailTo: '',
    emailCc: '',
    emailBcc: '',
    emailSubject: '',
    emailBody: '',
  };

  window.initOneForm(divId, formProps);
}
