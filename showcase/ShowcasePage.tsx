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
    kicker: '01 · 光的性格',
    title: '先看颜色和质感，再决定用哪盏灯。',
    body: '白光、彩光、硬光和柔光会同时作用于人物、地面和白棚反射。结果不是参数表，而是可以直接判断的画面。',
    image: colorShotUrl,
    alt: '绿色彩光照亮人物并染色白棚',
  },
  {
    kicker: '02 · 阴影关系',
    title: '灯位一变，影子的方向和长度立刻回应。',
    body: '把灯放低，地面投影拉长；把灯升高，影子收短。用可见变化沟通，而不是靠所有人想象同一句话。',
    image: shadowShotUrl,
    alt: '低灯位形成更长的白棚地面投影',
  },
  {
    kicker: '03 · 镜头结果',
    title: '最后站到摄影机里，看这套光是否真的成立。',
    body: '从自由视角切换到镜头视角，调整焦段、画幅和机位。布光、构图与人物关系留在同一个工作台里。',
    image: lensShotUrl,
    alt: 'Direct Light 摄影机镜头视角中的人物和光影',
  },
]

const metrics = [
  ['6', '盏灯同时管理'],
  ['5', '个人物共同走位'],
  ['4', '种视角快速切换'],
  ['A/B', '冻结方案直接比较'],
]

const workflow = [
  {
    number: '01',
    title: '摆出关系',
    text: '放入人物、灯具和控光附件，先建立一个所有人都能看懂的白棚。',
  },
  {
    number: '02',
    title: '进入镜头',
    text: '调整机位、焦段与画幅，让布光判断回到最终会被拍到的画面。',
  },
  {
    number: '03',
    title: '带走方案',
    text: '保存预设，冻结 A/B，对比差异，再导出预览图交给团队继续沟通。',
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
          <p className="eyebrow">White-studio lighting previz</p>
          <h1 id="hero-title">
            在开机之前，
            <span>先看见光。</span>
          </h1>
          <p className="hero-lead">
            面向导演、摄影指导和灯光师的白棚灯光预演工具。
            <br />
            摆灯、看镜头、比较方案，把抽象讨论变成同一张画面。
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={demoHref}>
              直接开始
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
            <p className="eyebrow">Visible decisions</p>
            <h2 id="story-title">灯一动，画面就回答。</h2>
            <p>
              Direct Light 不追求把片场塞进浏览器。它只把最需要提前说清楚的关系——灯、人物、镜头和影子——放在一个实时白棚里。
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
            <p className="eyebrow">One focused workspace</p>
            <h2 id="toolkit-title">不是重型渲染器。是把话说清楚的工作台。</h2>
          </header>

          <div className="bento-grid">
            <article className="bento-card bento-card-wide" data-reveal>
              <div className="bento-copy">
                <p>Color &amp; modifiers</p>
                <h3>把光的颜色、方向和软硬放到同一张图里。</h3>
              </div>
              <img src={colorShotUrl} alt="彩色光与控光附件在白棚中的效果" />
            </article>

            <article className="bento-card bento-card-number" data-reveal>
              <span>最多</span>
              <strong>6</strong>
              <h3>盏灯，同时保持实时反馈。</h3>
              <p>硬光、柔光、面光与灯具预设都可以继续手动微调。</p>
            </article>

            <article className="bento-card bento-card-views" data-reveal>
              <p>Four views</p>
              <h3>自由、镜头、俯视、侧视。</h3>
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
                <p>Freeze the decision</p>
                <h3>冻结 A/B，再讨论差异。</h3>
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
            <p className="eyebrow">From thought to frame</p>
            <h2 id="workflow-title">三步，把想法带到片场。</h2>
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
              <span>浏览器打开，即刻使用</span>
              <strong>纯前端。无需账户。没有等待。</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="final-section" aria-labelledby="final-title">
        <div className="final-glow" aria-hidden="true" />
        <div data-reveal>
          <p className="eyebrow">Direct Light</p>
          <h2 id="final-title">下一次开机前，先把光摆出来。</h2>
          <p>在线版免安装。macOS 桌面版可下载。项目完全开源。</p>
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
        <p>为导演、摄影指导与灯光师做的白棚灯光预演工具。</p>
        <nav aria-label="Footer links">
          <a href={githubHref}>GitHub</a>
          <a href={supportHref}>Discussions</a>
          <a href={releaseHref}>Releases</a>
        </nav>
      </footer>
    </main>
  )
}
