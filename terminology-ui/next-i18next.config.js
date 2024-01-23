const isBrowser = typeof window !== 'undefined';

module.exports = {
  i18n: {
    defaultLocale: 'fi',
    locales: ['fi', 'en', 'sv'],
    localeDetection: false,
  },
  react: { useSuspense: false }, //this line
  partialBundledLanguages: isBrowser && true,
};
