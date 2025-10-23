import { Blocks, Github, Twitter, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation('landing');

  return (
    <footer className="bg-card text-muted-foreground py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Blocks className="w-8 h-8 text-foreground" />
              <span className="text-2xl font-bold text-foreground">Plugnix</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/vincent-ng/plugnix"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center hover:bg-accent transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">{t('footer.resources.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/vincent-ng/plugnix" className="hover:text-foreground transition-colors">
                  {t('footer.resources.documentation')}
                </a>
              </li>
              <li>
                <a href="https://github.com/vincent-ng/plugnix" className="hover:text-foreground transition-colors">
                  {t('footer.resources.github')}
                </a>
              </li>
              <li>
                <a href="https://github.com/vincent-ng/plugnix/issues" className="hover:text-foreground transition-colors">
                  {t('footer.resources.issues')}
                </a>
              </li>
              <li>
                <a href="https://github.com/vincent-ng/plugnix/discussions" className="hover:text-foreground transition-colors">
                  {t('footer.resources.discussions')}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">{t('footer.community.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/vincent-ng/plugnix/blob/main/CONTRIBUTING.md" className="hover:text-foreground transition-colors">
                  {t('footer.community.contributing')}
                </a>
              </li>
              <li>
                <a href="https://github.com/vincent-ng/plugnix/blob/main/LICENSE" className="hover:text-foreground transition-colors">
                  {t('footer.community.license')}
                </a>
              </li>
              <li>
                <a href="https://github.com/vincent-ng" className="hover:text-foreground transition-colors">
                  {t('footer.community.about')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Plugnix. {t('footer.copyright')}
          </p>
          <p className="text-muted-foreground text-sm flex items-center space-x-1">
            <span>{t('footer.builtWith')}</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>{t('footer.byDevelopers')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;