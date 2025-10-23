import { Github, BookOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CTASection = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-950 dark:to-slate-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,transparent,black)]"></div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <a
                href="https://github.com/vincent-ng/plugnix"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all hover:scale-105 shadow-lg font-semibold"
              >
                <Github className="w-5 h-5" />
                <span>{t('cta.starOnGithub')}</span>
              </a>
              <a
                href="https://github.com/vincent-ng/plugnix/tree/master/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-8 py-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all hover:scale-105 font-semibold"
              >
                <BookOpen className="w-5 h-5" />
                <span>{t('cta.readDocs')}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center justify-center space-x-8 text-slate-400">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm">{t('cta.badgeOpenSource')}</div>
              </div>
              <div className="h-12 w-px bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{t('cta.badgePlugin')}</div>
                <div className="text-sm">{t('cta.badgeModular')}</div>
              </div>
              <div className="h-12 w-px bg-slate-700"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{t('cta.badgePerformance')}</div>
                <div className="text-sm">{t('cta.badgeEnterprise')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;