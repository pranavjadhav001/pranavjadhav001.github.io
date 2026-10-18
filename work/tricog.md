---
layout: blog
permalink: /work/tricog/
title: 'Tricog Health'
lead: "Echo AI, report generation, and the clinical plumbing around them at Tricog Health."
---

<div class="back-link-wrap is-wide"><a class="back-link" href="/about/">&larr; About</a></div>

<div class="work-page">

  <header class="masthead">
    <div>
      <h1>Tricog Health</h1>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>

  <div class="work-grid">

    <aside class="work-side">
      <div class="side-block">
        <p class="side-label">Timeline</p>
        <ol class="timeline">
        <li class="timeline-item" data-role="ml">
          <div class="timeline-date">Jun 2022</div>
          <h3 class="timeline-title">Machine learning engineer</h3>
          <p class="timeline-desc">Worked as an IC developing solutions that automate diagnostic workflows for clinicians.</p>
        </li>
        <li class="timeline-item" data-role="senior">
          <div class="timeline-date">Dec 2024</div>
          <h3 class="timeline-title">Senior machine learning engineer</h3>
          <p class="timeline-desc">Promoted for taking initiative beyond the usual tasks assigned and developing a whole fleet of DL models.</p>
        </li>
        <li class="timeline-item" data-role="present">
          <div class="timeline-date">Present</div>
          <h3 class="timeline-title">Training multimodal echo models</h3>
          <p class="timeline-desc">Tinkering with <strong>foundation models for echocardiography</strong>.</p>
        </li>
      </ol>
      </div>
      <div class="side-block">
        <p class="side-label">Stack</p>
        <ul class="chips">
          <li>Python</li><li>PyTorch</li><li>HuggingFace</li><li>LLMs</li><li>DPR</li><li>Triton Inference Server</li><li>DICOM</li><li>AWS Lambda</li><li>Kubernetes</li>
        </ul>
      </div>
      <div class="side-block">
        <p class="side-label">Website</p>
        <a class="company-link" href="https://www.tricog.com/" target="_blank" rel="noopener">tricog.com &#8599;</a>
      </div>
    </aside>

    <div class="work-main">

      <section class="project work-intro">
        <div class="project-body">
          <p>I've always been curious about <strong>solving healthcare challenges</strong>, through Kaggle competitions or personal projects. Joining Tricog Health, one of the leading HealthTech AI companies in India, made all the sense. It specializes in all things cardiac, and I was hired to work on the Echocardiography product given my expertise in computer vision.</p>
        </div>
      </section>

      <section class="project" id="instaecho">
        <div class="project-head"><h2>InstaEcho</h2></div>
        <div class="project-body">
          <p>InstaEcho is Tricog's offering for <strong>diagnosing echocardiography</strong>: a platform where our in-house echo technicians and doctors diagnose echo cases from clinics and hospital chains across India and the Philippines.</p>
          <p>An echo is an ultrasound of the heart. The operator at the clinic examines the patient, captures the different views of the heart in multiple images and videos, and uploads them to our platform. Our in-house clinicians then perform the measurements and analysis on our proprietary software.</p>
        </div>
        <figure class="figure">
          <div class="figure-frame" style="background:#1e2226;padding:0;overflow:hidden"><video src="/img/work/tricog/instaecho-viewer.mp4" poster="/img/work/tricog/instaecho-viewer-poster.jpg" autoplay muted loop playsinline style="display:block;width:100%;height:auto"></video></div>
          <figcaption class="figure-caption">The InstaEcho viewer.</figcaption>
        </figure>
        <div class="project-body">
          <p>A case takes about <strong>15 to 25 minutes</strong> to diagnose, and complex ones take longer. In that time the clinician identifies the right views of the heart, performs linear, area, and volume measurements, skims all the media for subjective markers, and writes a detailed case summary of the observations and conclusions.</p>
          <p>It is a lengthy procedure, and my job is to assist the clinicians by automating many of these steps. The final say still lies with them: they can accept my model's prediction, edit it, or override it completely.</p>
        </div>
      </section>

      <article class="project" id="views" data-role="ml">
        <div class="project-head"><span class="project-num">01</span><h2>Echo view classification</h2></div>
        <div class="project-body">
          <p>An echo study is a stack of short ultrasound clips, each taken from a different probe position, or view. Every measurement downstream depends on knowing which view a clip shows.</p>
          <p>Views come in a hierarchy: the acoustic window the probe sits in, then the view within it, then for some views the level of the cut. I built a <strong>hierarchical view classification model</strong> and co-authored a research paper on its design and performance.</p>
        </div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_views_chalk.html" title="Animated chalk figure: a tree of echo views grows from window to view to level" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p><strong>What makes it hard</strong> is that siblings in the tree look nearly the same. A small tilt of the probe turns one view into the next, and a single frame often shows just one structure of difference. On top of that, the classes are imbalanced, since some views are captured far more often than others, and the labels are noisy because of inter-observer variability, where the labels of two experts may differ, and intra-observer variability, where the same expert can label a borderline clip differently on another day. My model classifies views with <strong>91% accuracy</strong>.</p>
        </div>
        <figure class="figure lookalikes">
          <div class="figure-frame">
            <div class="pair"><div class="view"><img src="/img/work/tricog/view-a4c.jpg" alt="Apical 4-chamber echo frame" loading="lazy"><span>A4C</span></div><div class="view"><img src="/img/work/tricog/view-a5c.jpg" alt="Apical 5-chamber echo frame" loading="lazy"><span>A5C</span></div></div>
            <div class="pair"><div class="view"><img src="/img/work/tricog/view-a2c.jpg" alt="Apical 2-chamber echo frame" loading="lazy"><span>A2C</span></div><div class="view"><img src="/img/work/tricog/view-a3c.jpg" alt="Apical 3-chamber echo frame" loading="lazy"><span>A3C</span></div></div>
          </div>
        </figure>
      </article>

      <article class="project" id="doppler" data-role="ml">
        <div class="project-head"><span class="project-num">02</span><h2>Doppler reference line</h2></div>
        <div class="project-body">
          <p>The Doppler baseline, or reference line, is what every velocity in a Doppler trace is read against, so its placement is critical for an accurate diagnosis. The DICOM of an echo scan carries it twice: drawn on the image, and as numbers, Reference Pixel X0 and Reference Pixel Y0.</p>
          <p>The trouble starts when that numeric value is missing or wrong. Missing, the study can't be measured at all; wrong, every velocity shifts and the diagnosis can be wrong too.</p>
        </div>
        <figure class="figure">
          <div class="figure-frame" style="background:#000"><img src="/img/work/tricog/dlrd.png" alt="A Doppler trace with its reference line marked" loading="lazy"></div>
          <figcaption class="figure-caption">A Doppler trace: velocities above and below the reference line.</figcaption>
        </figure>
        <div class="project-body">
          <p>So the challenge was to <strong>find Reference Pixel Y0</strong> (the y coordinate where the reference line is drawn) from the image alone. I developed a DL model that does that, with 90% accuracy.</p>
        </div>
      </article>

      <article class="project" id="dicom-sr" data-role="ml">
        <div class="project-head"><span class="project-num">03</span><h2>DICOM SR</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_sr_chalk.html" title="Animated chalk figure: measurements from three vendors' echo machines flow as DICOM SR to the Tricog cloud, are mapped to one standard, and show up in the viewer" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>A software project I worked on, where the problem was the measurements: they arrived from thousands of centers and hundreds of echo machine variants, each reporting them its own way, and were entered by hand.</p>
          <p>I built DICOM SR infrastructure that <strong>standardizes cardiac measurement</strong> reporting for Tricog and encodes it automatically in under a second.</p>
        </div>
      </article>

      <article class="project" id="deid" data-role="senior">
        <div class="project-head"><span class="project-num">04</span><h2>De-identification</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_deid_chalk.html" title="Animated chalk figure: burned-in patient text is blacked out and DICOM tags are scrubbed" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Before any data can be used to train models, it has to be sanitized of PII (personally identifiable information). In a medical system PII hides in a lot of places: the media (images, videos, DICOMs), metadata JSONs, and DB tables.</p>
          <p>I owned and built a <strong>HIPAA-compliant de-identification pipeline</strong> that anonymizes all of them, deployed on AWS Lambda and Kubernetes.</p>
        </div>
      </article>

      <article class="project" id="ef" data-role="senior">
        <div class="project-head"><span class="project-num">05</span><h2>Ejection fraction</h2></div>
        <div class="project-body">
          <p>Ejection fraction is the share of blood the left ventricle pushes out with each beat, and a core number in every echo report.</p>
          <p>The standard way to measure it is Simpson's biplane method. In both the apical 4-chamber and 2-chamber views, the clinician picks the end-diastole (ED) and end-systole (ES) frames, traces the LV cavity, and marks the apex and mitral annulus to set the long axis. The cavity is sliced into 20 discs whose volumes add up to the LV volume, and EF = (EDV - ESV) / EDV. Measured by hand, it takes about 5 minutes per study.</p>
        </div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_ef_steps_chalk.html" title="Animated chalk figure: Simpson's biplane method in five steps, from picking ED and ES frames to the EF ratio" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>I architected and trained the models for it: a multi-task model for <strong>cardiac cavity segmentation and landmark keypoint detection</strong>, and a separate model for <strong>diastole and systole regression</strong>: a 2D CNN encoder followed by a temporal BERT, which returns a -1 to +1 signal the same length as the input clip, so its peaks and troughs mark ED and ES.</p>
        </div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_ef_chalk.html" title="Animated chalk figure: model 1 segments the left ventricle and finds keypoints, model 2 picks the ED and ES frames, and together they give ejection fraction" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>It brought the assessment from 5 minutes to under 3 seconds.</p>
        </div>
      </article>

      <article class="project" id="serving" data-role="senior">
        <div class="project-head"><span class="project-num">06</span><h2>Serving at scale</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_pipeline_chalk.html" title="Animated chalk figure: an echo study flows through models on one Triton server into a report" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>One echo study is about 5 videos and 750 frames, and every frame goes through several models before a report can go out. I designed and deployed the cardiac ultrasound pipeline on Triton Inference Server. A study runs end to <strong>end in under 14 seconds</strong>, scaling to about 50K cases a day on a single GPU.</p>
        </div>
      </article>

      <article class="project" id="cohort" data-role="senior">
        <div class="project-head"><span class="project-num">07</span><h2>Cohort retrieval</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_cohort_chalk.html" title="Animated chalk figure: every report is encoded by DPR and its embedding saved; a query is encoded the same way and matched by similarity, returning a direct match, an abbreviation, and a paraphrase" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Cohort retrieval means getting similar cases: a semantic search for conditions and symptoms across the entire corpus of cases, which lives in thousands of unstructured diagnostic reports.</p>
          <p>It has its own uses. The business team wants to pull data, and we want to quickly get slices of a large corpus to run EDA or evaluate a model on that particular slice. But each case summary is unstructured, so BM25 and fuzzy matching won't suffice.</p>
          <p>I researched and trained a <strong>DPR (dense passage retrieval)</strong> model to retrieve medical conditions, anatomical structures, and severities from those reports, achieving over a 50% improvement over the BM25 baseline.</p>
          <p>Based on this I wrote the paper <a href="https://arxiv.org/abs/2507.01049" target="_blank" rel="noopener">Cohort Retrieval using Dense Passage Retrieval</a>.</p>
        </div>
      </article>

      <article class="project" id="reports" data-role="senior">
        <div class="project-head"><span class="project-num">08</span><h2>LLM report generation</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_report_chalk.html" title="Animated chalk figure: measurements and observations go into an LLM fine-tuned with LoRA, which writes the case summary" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>I fine-tuned an LLM with LoRA, which takes the measurements and observations as input and writes the summary. I designed domain-specific <strong>evaluations to measure factual consistency and faithfulness</strong> rather than relying solely on conventional text-generation metrics. The system achieved performance comparable to human-generated reports while saving approximately 3–4 minutes per case.</p>
          <p>The drawback of this approach: since the model only looks at the measurements and observations entered by the clinician, and not the media, it can only summarize the information it is given. Sometimes clinicians skip an observation or a measurement, and some subjective findings are only ever captured in the summary itself.</p>
        </div>
      </article>

      <article class="project" id="multimodal" data-role="present">
        <div class="project-head"><span class="project-num">09</span><h2>Multimodal echo models</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/tricog_multimodal_chalk.html" title="Animated chalk figure: per-frame, per-video and per-case signals train image, video and text encoders into one shared space" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Lately I've been tinkering with <strong>foundation models for echocardiography</strong>, since we are sitting on a rich annotated dataset in a niche domain. There are dense signals per frame (the measurements performed on it), per video (choosing the right frames), and per case (the final summary). Training a holistic system is tricky, but it gives you decent image, video, and text encoders: great backbones for fine-tuning tasks and for cross-modal retrieval.</p>
        </div>
      </article>

    </div>
  </div>

</div>

<script>
  (function () {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;
    var root = document.documentElement;
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveIsDark = current ? current === "dark" : prefersDark;
      root.setAttribute("data-theme", effectiveIsDark ? "light" : "dark");
    });
  })();
</script>
<script>
  // light up the role on the left whose project card is in the middle of the screen
  (function () {
    var items = document.querySelectorAll(".timeline-item[data-role]");
    var cards = document.querySelectorAll(".project[data-role]");
    if (!items.length || !("IntersectionObserver" in window)) return;
    var timeline = items[0].parentNode;
    function show(role) {
      timeline.classList.toggle("has-spy", !!role);
      items.forEach(function (li) { li.classList.toggle("is-active", li.dataset.role === role); });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target.dataset.role); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    cards.forEach(function (c) { io.observe(c); });
    var intro = document.querySelector(".work-intro");
    if (intro) new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) show(null);
    }, { rootMargin: "-40% 0px -55% 0px" }).observe(intro);
  })();
</script>
