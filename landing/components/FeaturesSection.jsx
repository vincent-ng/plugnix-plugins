import { Blocks, Lock, Globe, Palette, Zap, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeaturesSection = () => {
  const { t } = useTranslation('landing');

  const features = [
    {
      icon: Blocks,
      title: t('features.pluginArchitecture.title'),
      description: t('features.pluginArchitecture.description'),
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: t('features.lightningFast.title'),
      description: t('features.lightningFast.description'),
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: t('features.i18nSupport.title'),
      description: t('features.i18nSupport.description'),
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: Palette,
      title: t('features.themeSystem.title'),
      description: t('features.themeSystem.description'),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: Lock,
      title: t('features.authRbac.title'),
      description: t('features.authRbac.description'),
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: Database,
      title: t('features.supabaseBackend.title'),
      description: t('features.supabaseBackend.description'),
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  const techStack = [
    t('tech.react'),
    t('tech.vite'),
    t('tech.pluginSystem'),
    t('tech.tailwind'),
    t('tech.supabase'),
    t('tech.router')
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            {t('everythingTitle')}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('everythingSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-700"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-2xl p-12 text-center shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-4">
            {t('builtWithTechTitle')}
          </h3>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            {t('builtWithTechSubtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20 font-medium hover:bg-white/20 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;