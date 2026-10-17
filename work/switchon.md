---
layout: blog
permalink: /work/switchon/
title: 'SwitchOn'
lead: "Different inspection models that run on edge, custom tailored for each line and each plant."
date: 2026-10-15
---

<div class="back-link-wrap"><a class="back-link" href="/about/">&larr; About</a></div>

<div class="page">

  <header class="masthead">
    <div>
      <div class="eyebrow">computer vision &middot; edge inference &middot; manufacturing &middot; OCR &middot; anomaly detection</div>
      <h1>SwitchOn</h1>
      <p class="subtitle">Different inspection models that run on edge, custom tailored for each line and each plant.</p>
      <p class="meta-line"><b>Computer Vision Engineer</b><span class="sep">&middot;</span>Aug 2019 to Jun 2022<span class="sep">&middot;</span>Bangalore</p>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>


  <div class="prose">

    <section>
      <ol class="timeline">
        <li class="timeline-item">
          <div class="timeline-date">2019</div>
          <h3 class="timeline-title">Computer vision intern</h3>
          <p class="timeline-desc">I joined as SwitchOn's first computer vision hire. Back then it was an IoT company: it predicted machine breakdowns from vibration data with time-series models and alerted plant officials. My job was to try our luck in vision, automating any grunt work that needed a pair of eyes with cameras and vision models: counting manufactured goods, inspecting parts, and reading date and batch numbers.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2020</div>
          <h3 class="timeline-title">Hired full time</h3>
          <p class="timeline-desc">Early proofs of concept worked, so a slow pivot began: more engineers moved from the IoT side to the vision product.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2022</div>
          <h3 class="timeline-title">Left SwitchOn</h3>
          <p class="timeline-desc">By then the company had fully embraced vision, with the product deployed on multiple lines across plants all over India.</p>
        </li>
      </ol>
    </section>

    <section>
      <h2 id="the-station">The station</h2>
      <p>The auto-parts plants we worked in had no reliable network, so nothing could go to the cloud. Every station carried its own stack: a top <strong>industrial-grade camera</strong> over the conveyor, a <strong>Jetson Nano or Xavier</strong> running the models, a <strong>local screen</strong> for the operator, and a <strong>reject arm</strong> that pulls failing parts off the line.</p>
      <p>Each part passes three checks at the same station: surface defects, a part count, and the stamped batch number. The line doesn't wait for the models, so the whole loop runs under <strong>10 ms</strong>: image capture and reading, TensorRT inference, then the result on screen and the reject or OK trigger.</p>

      <figure class="chalk-figure">
        <iframe src="/work/figures/switchon_station_chalk.html" title="Animated chalk figure: an offline inspection station" loading="lazy"></iframe>
      </figure>
    </section>

    <section>
      <h2 id="the-core-problem">The core problem</h2>
      <p>Defects are rare and never look the same twice: scratches, dents, porosity, missing features, some only a millimetre across. Collecting labeled examples of each is hopeless. Good parts, though, come off the line by the thousand.</p>
      <p>This makes it an <strong>unsupervised anomaly detection</strong> problem: learn only what <em>good</em> looks like and flag anything that doesn't fit. We approached this problem in many different ways:</p>
      <ul>
        <li><strong>One-class classification:</strong> draw a tight boundary around the single class of good parts. Anything outside it is an anomaly.</li>
        <li><strong>Autoencoder:</strong> compress a good part and rebuild it. It never learned to draw a scratch, so the difference between input and rebuild lights up the defect.</li>
        <li><strong>PaDiM:</strong> fit a Gaussian to pretrained CNN features at every patch location of good parts, then score a new part's patches by their distance from normal. I wrote an <a href="https://github.com/pranavjadhav001/tf_padim" target="_blank" rel="noopener">unofficial TensorFlow implementation</a>.</li>
      </ul>

      <!-- TODO: add the ResearchGate figure once it's saved to img/work/switchon/, with its paper credit
      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/work/switchon/anomaly-reference.png" alt="">
        </div>
        <figcaption class="figure-caption"><b>Source:</b> </figcaption>
      </figure>
      -->

      <figure class="chalk-figure">
        <iframe src="/work/figures/switchon_anomaly_chalk.html" title="Animated chalk figure: an autoencoder trained on good parts highlights a scratch" loading="lazy"></iframe>
      </figure>

      <p><strong>What makes this problem challenging?</strong> You can claim to catch the tiniest defects, but only within the variation your good parts showed during training. Lighting, the camera angle, and batch-to-batch differences all change how a good part looks. The more they vary, the wider the spread of "normal" at every point on the part. That forces a tradeoff: let small defects slip through, or catch them at the cost of false alarms and a high rejection rate.<br/>
        <strong>Why not cover every way a good part can look?</strong> Sounds good, but capturing the full distribution of good parts is close to impossible. Too many factors are beyond your control.<br/>
        <strong>Why not augment?</strong> An augmented image is a sincere attempt to simulate how the part will look under changed conditions, but reality is far from it. How light reflects and bounces inside a closed enclosure is very hard to predict without ray tracing.</p>
    </section>

    <section>
      <h2 id="counting">Counting parts</h2>
      <p>Some checks are simpler: are all the pieces there? A <strong>YOLO</strong> detector puts a box on each one, and the station compares the count against the spec. Take a bearing housing: one missing box means one missing ball.</p>

      <figure class="chalk-figure">
        <iframe src="/work/figures/switchon_counting_chalk.html" title="Animated chalk figure: YOLO boxes 13 balls in one housing and finds a missing ball in another" loading="lazy"></iframe>
      </figure>
    </section>

    <section>
      <h2 id="reading-the-batch">Reading the batch number</h2>
      <p>Every part is stamped with a batch code, so a bad batch can be traced and recalled. Stamped metal is hard to read: low contrast, glare, and characters that change with the angle of the light.</p>

      <p>I built this OCR from scratch in two stages. A <strong>character-level</strong> model finds the text lines and boxes each character. A <strong>CRNN</strong> then reads a whole line as a sequence: a CNN turns the image into column features, an LSTM reads them left to right, and CTC decoding merges repeats and blanks into the final string.</p>

      <figure class="chalk-figure">
        <iframe src="/work/figures/switchon_ocr_chalk.html" title="Animated chalk figure: finding text lines, boxing characters, and reading the line with a CRNN" loading="lazy"></iframe>
      </figure>
    </section>

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
