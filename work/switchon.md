---
layout: blog
permalink: /work/switchon/
title: 'SwitchOn'
lead: "Different inspection models that run on edge, custom tailored for each line and each plant."
---

<div class="back-link-wrap is-wide"><a class="back-link" href="/">&larr; Home</a></div>

<div class="work-page">

  <header class="masthead">
    <div>
      <h1>SwitchOn</h1>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>

  <div class="work-grid">

    <aside class="work-side">
      <div class="side-block">
        <p class="side-label">Timeline</p>
        <ol class="timeline">
        <li class="timeline-item">
          <div class="timeline-date">2019</div>
          <h3 class="timeline-title">Computer vision intern</h3>
          <p class="timeline-desc">I joined as SwitchOn's first computer vision hire. Back then it was an IoT company: it predicted machine breakdowns from vibration data with time-series models and alerted plant officials. My job was to try our luck in vision, automating any grunt work at shopfloor that needed a pair of eyes with cameras and vision models: counting manufactured goods, inspecting parts, and reading date and batch numbers.</p>
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
      </div>
      <div class="side-block">
        <p class="side-label">Stack</p>
        <ul class="chips">
          <li>Python</li><li>TensorFlow</li><li>TensorRT</li><li>YOLO</li><li>CRNN</li><li>PaDiM</li><li>Autoencoders</li><li>Jetson Nano / Xavier</li><li>Intel NUC</li>
        </ul>
      </div>
      <div class="side-block">
        <p class="side-label">Website</p>
        <a class="company-link" href="https://switchon.io/" target="_blank" rel="noopener">switchon.io &#8599;</a>
      </div>
    </aside>

    <div class="work-main">

      <article class="project" id="station">
        <div class="project-head"><span class="project-num">01</span><h2>The station</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/switchon_station_chalk.html" title="Animated chalk figure: an offline inspection station" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Auto-parts plants with no reliable network, so nothing could go to the cloud and they require real time results within a few ms.</p>
          <p>The station has a top industrial-grade camera over the conveyor, a Jetson Nano or Xavier running the models, a local screen for the operator, and a reject arm. Each part goes through one loop: image capture and reading, TensorRT inference, then the result on screen and the reject or OK trigger. One station runs three checks: surface defects, part count, and the stamped batch number.</p>
          <p>The whole loop runs under 10 ms, fully offline.</p>
        </div>
      </article>

      <article class="project" id="inspection">
        <div class="project-head"><span class="project-num">02</span><h2>Surface inspection</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/switchon_anomaly_chalk.html" title="Animated chalk figure: an autoencoder trained on good parts highlights a scratch" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Defects are rare and never look the same twice: scratches, dents, porosity, missing features, some only a millimetre across. Labeled examples of each are hopeless to collect, but good parts come off the line by the thousand.</p>
          <p>We framed it as <strong>unsupervised anomaly detection</strong>: learn only what good looks like, flag anything that doesn't fit. We tried one-class classification, autoencoders, and PaDiM, for which I wrote an <a href="https://github.com/pranavjadhav001/tf_padim" target="_blank" rel="noopener">unofficial TensorFlow implementation</a>.</p>
          <p>We deployed a Surface Inspection product that catches mm-level defects.</p>
        </div>
        <div class="hard">
          <p><strong>What makes this problem challenging?</strong> You can claim to catch the tiniest defects, but only within the variation your good parts showed during training. Lighting, the camera angle, and batch-to-batch differences all change how a good part looks. The more they vary, the wider the spread of "normal" at every point on the part. That forces a tradeoff: let small defects slip through, or catch them at the cost of false alarms and a high rejection rate.<br/><br/>
          <strong>Why not cover every way a good part can look?</strong> Sounds good, but capturing the full distribution of good parts is close to impossible. Too many factors are beyond your control.<br/><br/>
          <strong>Why not augment?</strong> An augmented image is a sincere attempt to simulate how the part will look under changed conditions, but reality is far from it. How light reflects and bounces inside a closed enclosure is very hard to predict without ray tracing.</p>
        </div>
      </article>

      <article class="project" id="counting">
        <div class="project-head"><span class="project-num">03</span><h2>Part counting</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/switchon_counting_chalk.html" title="Animated chalk figure: YOLO boxes 13 balls in one housing and finds a missing ball in another" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Are all the pieces there? Counting manufactured goods by eye is slow, repetitive work.</p>
          <p>A YOLO detector boxes each piece, and the station compares the count against the spec. In a bearing housing, one missing box means one missing ball.</p>
        </div>
      </article>

      <article class="project" id="ocr">
        <div class="project-head"><span class="project-num">04</span><h2>Batch OCR</h2></div>
        <figure class="chalk-figure">
          <iframe src="/work/figures/switchon_ocr_chalk.html" title="Animated chalk figure: finding text lines, boxing characters, and reading the line with a CRNN" loading="lazy"></iframe>
        </figure>
        <div class="project-body">
          <p>Every part carries a stamped batch code. Stamped metal is hard to read: low contrast, glare, and characters that change with the angle of the light.</p>
          <p>A character-level model finds the text lines and boxes each character. A CRNN reads a whole line as a sequence: a CNN turns the image into column features, an LSTM reads them left to right, and CTC decoding merges repeats and blanks into the final string.</p>
          <p>It became a 0 to 1 OCR product, built for real-world industrial conditions.</p>
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
