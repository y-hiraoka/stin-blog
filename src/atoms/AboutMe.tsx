import styles from "./AboutMe.module.css";
import { ExternalLink } from "./ExternalLink";
import { ExternalLinkIcon } from "./ExternalLinkIcon";
import { InfoCircleIcon } from "./InfoCircleIcon";
import { SidemenuTitle } from "./SidemenuTitle";

export const AboutMe: React.VFC = () => {
  return (
    <div>
      <SidemenuTitle icon={<InfoCircleIcon className={styles.icon} />}>
        About Me
      </SidemenuTitle>
      <div className={styles.wrapper}>
        <div className={styles.aboutme}>
          <img className={styles.avatar} src="/images/profile.jpg" alt="avatar" />
          <div className={styles.biography}>
            <p>すてぃん</p>
            <p>フロントエンドエンジニア</p>
            <p>React と TypeScript を好んでいます</p>
            <p>
              <ExternalLink href="https://github.com/y-hiraoka">
                GitHub <ExternalLinkIcon className={styles.linkIcon} />
              </ExternalLink>
            </p>
            <p>
              <ExternalLink href="https://twitter.com/stin_factory">
                Twitter <ExternalLinkIcon className={styles.linkIcon} />
              </ExternalLink>
            </p>
            <p>
              <ExternalLink href="https://qiita.com/stin_dev">
                Qiita <ExternalLinkIcon className={styles.linkIcon} />
              </ExternalLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
