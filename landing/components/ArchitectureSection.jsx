import { Layers, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ArchitectureSection = () => {
  const { t } = useTranslation('landing');

  return (
    <section id="architecture" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('modular.title')}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('modular.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('modular.points.registration')}</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('modular.points.registrationDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('modular.points.dynamicLoading')}</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('modular.points.dynamicLoadingDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('modular.points.isolatedComponents')}</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('modular.points.isolatedComponentsDesc')}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('modular.points.seamlessIntegration')}</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('modular.points.seamlessIntegrationDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border-l-4 border-slate-900 dark:border-white">
                <div className="flex items-center space-x-3 mb-2">
                  <Layers className="w-5 h-5 text-slate-900 dark:text-white" />
                  <span className="font-bold text-slate-900 dark:text-white">{t('modular.card.coreFramework')}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t('modular.card.coreDesc')}</p>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <div className="font-semibold text-slate-900 mb-1">{t('modular.card.pluginA')}</div>
                  <div className="text-xs text-slate-600">{t('modular.card.pluginADesc')}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <div className="font-semibold text-slate-900 mb-1">{t('modular.card.pluginB')}</div>
                  <div className="text-xs text-slate-600">{t('modular.card.pluginBDesc')}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                  <div className="font-semibold text-slate-900 mb-1">{t('modular.card.pluginC')}</div>
                  <div className="text-xs text-slate-600">{t('modular.card.pluginCDesc')}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <div className="font-semibold text-slate-900 mb-1">{t('modular.card.pluginD')}</div>
                  <div className="text-xs text-slate-600">{t('modular.card.pluginDDesc')}</div>
                </div>
              </div>

              <div className="flex items-center justify-center py-2">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg p-6 text-center">
                <div className="font-bold mb-1">{t('modular.card.yourApp')}</div>
                <div className="text-sm text-slate-400 dark:text-slate-600">{t('modular.card.yourAppDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;