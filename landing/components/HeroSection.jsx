import { ArrowRight, Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="pt-20 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('heroBadge')}</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            {t('hero.title.line1')}
            <br />
            <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              {t('hero.title.line2')}
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
            <a
              href="https://github.com/vincent-ng/plugnix"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="font-semibold">{t('hero.cta.primary')}</span>
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/vincent-ng/plugnix/tree/master/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:scale-105"
            >
              <Terminal className="w-5 h-5" />
              <span className="font-semibold">{t('hero.cta.secondary')}</span>
            </a>
          </div>

          <div className="bg-slate-900 dark:bg-slate-900 rounded-xl p-6 max-w-3xl mx-auto shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-slate-400 text-sm ml-4">terminal</span>
            </div>
            <div className="font-mono text-left">
              <div className="text-green-400 mb-2">$ npx plugnix-cli init my-app</div>
              <div className="text-slate-400 mb-2">✓ {t('hero.terminal.line1')}</div>
              <div className="text-green-400 mb-2">$ cd my-app</div>
              <div className="text-green-400 mb-2">$ npx plugnix-cli add landing auth dashboard</div>
              <div className="text-slate-400 mb-2">✓ {t('hero.terminal.line2')}</div>
              <div className="text-slate-400">✓ {t('hero.terminal.line3')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;