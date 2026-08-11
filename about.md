---
layout: about
permalink: /about/
title: About
---

<div class="back-link-wrap"><a class="back-link" href="/">&larr; Home</a></div>

<div class="page">

  <header class="masthead">
    <div>
      <div class="eyebrow">machine learning &middot; computer vision &middot; healthcare</div>
      <h1>Hi, I'm Pranav Jadhav</h1>
      <p class="subtitle">Senior Machine Learning Engineer</p>
      <p class="byline">I work at the intersection of <strong>healthcare and AI</strong> at Tricog Health, with <strong>6+ years</strong> building production systems. I work with <strong>medical imaging, LLMs, computer vision, and inference optimization</strong> at clinical scale. I'm happiest working on details a metric won't catch but will impact the end user.<br>In my personal time, I love following, reading, and implementing the latest research and software ideas wherever my curiosity takes me. I also read and listen to fiction, non-fiction, philosophy, and politics across books and podcasts.<br>Off the clock: I'm a <a href="/coffee/">home barista</a>, <a href="https://letterboxd.com/pranavjadhav/" target="_blank" rel="noopener">cinephile</a>, <a href="https://www.goodreads.com/user/show/61567123-pranav-jadhav" target="_blank" rel="noopener">light reader</a>, and footballer.</p>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>

  <section class="skills">
    <h2 class="section-label">Core Skills</h2>
    <p class="skills-line">Python &middot; TensorFlow &middot; PyTorch &middot; HuggingFace &middot; OpenCV &middot; Deep Learning &middot; Computer Vision &middot; LLMs &middot; RAG &middot; Metric Learning &middot; Semantic Search &middot; Diffusion Modelling &middot; Model Optimization &middot; OCR &middot; Object Detection &amp; Segmentation &middot; Triton Inference Server &middot; AWS &middot; Docker &middot; MLOps</p>
  </section>

  <section class="experience">
    <h2 class="section-label">Experience</h2>

    <div class="job">
      <div class="job-dates">Dec 2024 - Present</div>
      <div class="job-body">
        <h3>Tricog Health <span class="job-role">&middot; Senior Machine Learning Engineer</span></h3>
        <div class="job-location">Bangalore</div>
        <ul>
          <li>Researched and trained a DPR model to retrieve medical conditions, anatomical structures, and severities from thousands of unstructured diagnostic reports, achieving <strong>over a 50% improvement</strong> over the BM25 baseline.</li>
          <li>Led end-to-end development of an <strong>LLM-powered automatic report generation</strong> system, evaluated through custom domain-specific methods, <strong>saving 3&ndash;4 minutes per case</strong> while matching human-level performance.</li>
          <li>Architected and trained a multi-task model comprising cardiac anatomical cavity segmentation, diastole/systole regression, and landmark keypoint detection, <strong>reducing manual ejection fraction assessment time from 5 min to &lt;3 sec</strong>.</li>
          <li>Designed and deployed a <strong>Triton Inference Server pipeline</strong> for cardiac ultrasound analysis, processing ~750 frames across 5 videos per echo study in under 14s end-to-end, scaling to <strong>~50K cases/day on a single GPU</strong>.</li>
          <li>Owned and built a <strong>HIPAA-compliant de-identification pipeline</strong> for echocardiography studies, anonymizing PHI in metadata and burned-in pixels, deployed on AWS Lambda and Kubernetes.</li>
        </ul>
      </div>
    </div>

    <div class="job">
      <div class="job-dates">Jun 2022 - Dec 2024</div>
      <div class="job-body">
        <h3>Tricog Health <span class="job-role">&middot; Machine Learning Engineer</span></h3>
        <div class="job-location">Bangalore</div>
        <ul>
          <li>Built a hierarchical echocardiographic view classification model with <strong>91% accuracy</strong> and co-authored a research paper detailing its design and performance.</li>
          <li>Developed a classification model to predict the reference line location in Doppler imagery, achieving <strong>90% accuracy</strong>.</li>
          <li>Built <strong>DICOM SR infrastructure</strong> standardizing cardiac measurement reporting across 1000s of centers and 100s of echo machine variants, replacing manual data entry with automated encoding in &lt;1 sec.</li>
        </ul>
      </div>
    </div>

    <div class="job">
      <div class="job-dates">Aug 2019 - Jun 2022</div>
      <div class="job-body">
        <h3>Switchon <span class="job-role">&middot; Computer Vision Engineer</span></h3>
        <div class="job-location">Bangalore</div>
        <ul>
          <li>Deployed a <strong>Surface Inspection</strong> product using unsupervised anomaly detection methods capable of identifying mm-level defects.</li>
          <li>Built a <strong>0 to 1 OCR product</strong>, designing and implementing models for character and word recognition tailored to real-world industrial environments.</li>
          <li>Established edge deployment infrastructure for Nvidia Xavier/Nano and Intel NUC, optimizing inference pipelines to <strong>under 10ms</strong> using TensorRT, pruning, and quantization.</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="contact">
    <h2 class="section-label">Contact</h2>
    <ul class="contact-list">
      <li><span class="contact-label">Location</span><span>Bengaluru, India</span></li>
      <li><span class="contact-label">Email</span><a href="mailto:pranavjadhav001@gmail.com">pranavjadhav001@gmail.com</a></li>
      <li><span class="contact-label">LinkedIn</span><a href="https://www.linkedin.com/in/pranavjadhav001/" target="_blank" rel="noopener">linkedin.com/in/pranavjadhav001</a></li>
      <li><span class="contact-label">GitHub</span><a href="https://github.com/pranavjadhav001" target="_blank" rel="noopener">github.com/pranavjadhav001</a></li>
      <li><span class="contact-label">X</span><a href="https://x.com/pranav9194" target="_blank" rel="noopener">@pranav9194</a></li>
    </ul>
  </section>

  <div class="resume-cta">
    <a class="resume-btn" href="/resume/25-04-2026_resume.pdf" target="_blank" rel="noopener">Download Resume</a>
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
