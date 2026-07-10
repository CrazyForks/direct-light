import { type PointerEvent, useEffect, useRef, useState } from 'react'
import heroVideoUrl from '../docs/media/hero.mp4'
import heroPosterUrl from '../docs/media/shot-lens.png'
import shadowShotUrl from '../docs/media/shot-shadow.png'
import colorShotUrl from '../docs/media/shot-color.png'
import lensShotUrl from '../docs/media/shot-lens.png'

const demoHref = import.meta.env.BASE_URL
const githubHref = 'https://github.com/oukeming64-tech/direct-light'
const supportHref = 'https://github.com/oukeming64-tech/direct-light/discussions'
const releaseHref = 'https://github.com/oukeming64-tech/direct-light/releases/latest'

const storyChapters = [
  {
    kicker: '01 · 看光',
    title: '先看颜色落在哪，再谈情绪。',
    body: '白光、彩光、硬光、柔光，都会落到人物、地面和白棚上。别在参数表里猜，直接看画面。',
    image: colorShotUrl,
    alt: '绿色彩光照亮人物并染色白棚',
  },
  {
    kicker: '02 · 看影',
    title: '灯位变了，影子不会含糊。',
    body: '灯放低，地面投影拉长；灯升高，影子收短。调一下，当场就知道差在哪。',
    image: shadowShotUrl,
    alt: '低灯位形成更长的白棚地面投影',
  },
  {
    kicker: '03 · 看镜头',
    title: '最后回到镜头里，判断这套光。',
    body: '切到摄影机视角，再调焦段、画幅和机位。灯怎么摆，最后都要回到会被拍下来的那一格。',
    image: lensShotUrl,
    alt: 'Direct Light 摄影机镜头视角中的人物和光影',
  },
]

const metrics = [
  ['6', '盏灯同棚'],
  ['5', '人同场走位'],
  ['4', '种观察视角'],
  ['A/B', '两个方案并排'],
]

const workflow = [
  {
    number: '01',
    title: '把关系摆出来',
    text: '人物站哪，灯从哪来，附件放在哪里。先把片场里最容易说岔的关系摆清楚。',
  },
  {
    number: '02',
    title: '站进镜头里',
    text: '切到摄影机视角，再调焦段、画幅和机位。最后拍到什么，现在就能看见。',
  },
  {
    number: '03',
    title: '把方案带走',
    text: '保存预设，冻结 A/B，再导出预览图。开会时少比划一点，看片时少猜一点。',
  },
]

function useRevealMotion(pageRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const items = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'))
      return
    }

    page.classList.add('motion-ready')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [pageRef])
}

export function ShowcasePage() {
  const [activeStory, setActiveStory] = useState(0)
  const pageRef = useRef<HTMLElement>(null)
  useRevealMotion(pageRef)

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    pageRef.current?.style.setProperty('--pointer-x', `${event.clientX}px`)
    pageRef.current?.style.setProperty('--pointer-y', `${event.clientY}px`)
  }

  return (
    <main className="showcase-page" ref={pageRef} onPointerMove={handlePointerMove}>
      <header className="site-header" aria-label="Direct Light navigation">
        <div className="header-shell">
          <a className="brand" href={demoHref} aria-label="打开 Direct Light">
            <span className="brand-mark" aria-hidden="true" />
            <span>Direct Light</span>
          </a>
          <nav className="header-links" aria-label="展示页章节">
            <a href="#story">画面</a>
            <a href="#toolkit">能力</a>
            <a href="#workflow">工作流</a>
            <a href={githubHref}>GitHub</a>
          </nav>
          <a className="header-cta" href={demoHref}>
            打开在线版
          </a>
        </div>
      </header>

      <section className="hero-section" id="overview" aria-labelledby="hero-title">
        <div className="hero-beam" aria-hidden="true" />
        <div className="hero-copy" data-reveal>
          <p className="eyebrow">Direct Light · 白棚灯光预演</p>
          <h1 id="hero-title">
            <span className="hero-line">先摆灯。</span>
            <span className="hero-line hero-line-accent">再开机。</span>
          </h1>
          <p className="hero-lead">
            <span>灯位、影子和镜头，装进一个实时白棚。</span>
            <span>开拍前，导演、摄影、灯光先看同一张画面。</span>
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={demoHref}>
              打开白棚
            </a>
            <a className="text-link" href={githubHref}>
              查看源代码 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="hero-stage" data-reveal>
          <div className="stage-glow" aria-hidden="true" />
          <div className="product-frame">
            <div className="frame-bar">
              <span className="frame-brand">
                <i aria-hidden="true" /> Direct Light
              </span>
              <span className="frame-status">Live white studio</span>
            </div>
            <video autoPlay muted loop playsInline poster={heroPosterUrl}>
              <source src={heroVideoUrl} type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section className="metrics-section" aria-label="Direct Light capabilities">
        <div className="metrics-shell">
          {metrics.map(([value, label]) => (
            <div className="metric" key={label} data-reveal>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="story-section" id="story" aria-labelledby="story-title">
        <div className="section-shell">
          <header className="section-heading" data-reveal>
            <p className="eyebrow">灯位 · 影子 · 镜头</p>
            <h2 id="story-title">
              <span className="headline-line">灯往哪走，</span>
              <span className="headline-line">画面就往哪变。</span>
            </h2>
            <p>
              “主光再低一点”说出口，每个人脑子里都可能是不同的画面。Direct Light
              把它落进白棚：灯怎么动，影子怎么变，镜头里当场见。
            </p>
          </header>

          <div className="story-layout">
            <div className="story-visual" aria-live="polite" data-reveal>
              <div className="story-screens">
                {storyChapters.map((chapter, index) => (
                  <img
                    className={index === activeStory ? 'story-screen is-active' : 'story-screen'}
                    src={chapter.image}
                    alt={index === activeStory ? chapter.alt : ''}
                    aria-hidden={index !== activeStory}
                    key={chapter.title}
                  />
                ))}
              </div>
              <div className="story-caption">
                <span>Direct Light</span>
                <span>{storyChapters[activeStory].kicker}</span>
              </div>
            </div>

            <div className="story-controls" data-reveal>
              {storyChapters.map((chapter, index) => (
                <button
                  className={index === activeStory ? 'story-control is-active' : 'story-control'}
                  type="button"
                  aria-pressed={index === activeStory}
                  onClick={() => setActiveStory(index)}
                  onFocus={() => setActiveStory(index)}
                  onMouseEnter={() => setActiveStory(index)}
                  key={chapter.title}
                >
                  <span>{chapter.kicker}</span>
                  <strong>{chapter.title}</strong>
                  <small>{chapter.body}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="toolkit-section" id="toolkit" aria-labelledby="toolkit-title">
        <div className="section-shell">
          <header className="section-heading section-heading-light" data-reveal>
            <p className="eyebrow">控制在手上 · 结果在画面里</p>
            <h2 id="toolkit-title">
              <span className="headline-line">参数可以很多，</span>
              <span className="headline-line">最后只看画面。</span>
            </h2>
          </header>

          <div className="bento-grid">
            <article className="bento-card bento-card-wide" data-reveal>
              <div className="bento-copy">
                <p>颜色与控光</p>
                <h3>颜色、方向、软硬，一张图里看完。</h3>
              </div>
              <img src={colorShotUrl} alt="彩色光与控光附件在白棚中的效果" />
            </article>

            <article className="bento-card bento-card-number" data-reveal>
              <span>最多</span>
              <strong>6</strong>
              <h3>盏灯，够把一场戏的关系摆开。</h3>
              <p>硬光、柔光、面光和灯具预设，套上以后都还能继续调。</p>
            </article>

            <article className="bento-card bento-card-views" data-reveal>
              <p>四种视角</p>
              <h3>换个视角，不用重搭一遍。</h3>
              <div className="view-orbit" aria-hidden="true">
                <span>镜头</span>
                <i />
                <span>俯视</span>
                <i />
                <span>侧视</span>
                <i />
                <span>自由</span>
              </div>
            </article>

            <article className="bento-card bento-card-compare" data-reveal>
              <div className="bento-copy">
                <p>冻结比较</p>
                <h3>A/B 冻结，差异不用靠记忆。</h3>
              </div>
              <div className="compare-images">
                <figure>
                  <span>A</span>
                  <img src={shadowShotUrl} alt="A 方案的长地面投影" />
                </figure>
                <figure>
                  <span>B</span>
                  <img src={lensShotUrl} alt="B 方案的摄影机画面" />
                </figure>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
        <div className="section-shell">
          <header className="workflow-heading" data-reveal>
            <p className="eyebrow">从白棚到片场</p>
            <h2 id="workflow-title">
              <span className="headline-line">摆灯。取景。</span>
              <span className="headline-line">带走。</span>
            </h2>
          </header>
          <div className="workflow-grid">
            {workflow.map((step) => (
              <article className="workflow-card" key={step.number} data-reveal>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <div className="workflow-preview" data-reveal>
            <img src={lensShotUrl} alt="Direct Light 镜头视角下的白棚布光方案" />
            <div>
              <span>打开浏览器，就进棚。</span>
              <strong>纯前端。免注册。没有等待。</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="final-section" aria-labelledby="final-title">
        <div className="final-glow" aria-hidden="true" />
        <div data-reveal>
          <p className="eyebrow">Direct Light</p>
          <h2 id="final-title">
            <span className="headline-line">下一场戏，</span>
            <span className="headline-line">先从光开始。</span>
          </h2>
          <p>在线打开，或者下载 macOS 版。项目完全开源。</p>
          <div className="final-actions">
            <a className="button button-primary" href={demoHref}>
              进入在线版
            </a>
            <a className="button button-secondary" href={releaseHref}>
              下载 macOS 版
            </a>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <a className="brand" href={demoHref}>
          <span className="brand-mark" aria-hidden="true" />
          <span>Direct Light</span>
        </a>
        <p>把灯位、影子和镜头放进同一个白棚。</p>
        <nav aria-label="Footer links">
          <a href={githubHref}>GitHub</a>
          <a href={supportHref}>Discussions</a>
          <a href={releaseHref}>Releases</a>
        </nav>
      </footer>
    </main>
  )
}
