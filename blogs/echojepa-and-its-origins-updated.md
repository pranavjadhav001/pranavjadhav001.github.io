---
layout: blog
permalink: /blogs/echojepa-and-its-origins/
title: 'Echo(JEPA) and Its Origins'
lead: "How Yann LeCun's bet against pixel prediction became the largest latent-predictive foundation model built for the heart."
date: 2026-08-11
mathjax: true
---

<div class="back-link-wrap"><a class="back-link" href="/">&larr; Home</a></div>

<div class="page">

  <header class="masthead">
    <div>
      <div class="eyebrow">self-supervised learning &middot; foundation models &middot; echocardiography</div>
      <h1>Echo(JEPA) and Its Origins</h1>
      <p class="subtitle">How Yann LeCun's bet against pixel prediction became the largest latent-predictive foundation model built for the heart.</p>
      <p class="meta-line"><b>Notes from an internal talk</b><span class="sep">&middot;</span>originally presented Apr 22, 2026<span class="sep">&middot;</span>Algorithm Team</p>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>

  <nav class="toc" aria-label="Table of contents">
    <p class="toc-title">Contents</p>
    <ol>
      <li><a href="#how-and-by-who">How and by Who?</a></li>
      <li><a href="#what-jepa-actually-predicts">What JEPA Actually Predicts</a></li>
      <li><a href="#self-supervised-learning-methods">Self-Supervised Learning Methods</a></li>
      <li><a href="#ijepa-first-implementation">I-JEPA: The First Concrete Implementation</a></li>
      <li><a href="#the-lineage">Journey to EchoJEPA</a></li>
      <li><a href="#ijepa-vjepa2-echojepa-changes">What Changed from I-JEPA to V-JEPA 2 to EchoJEPA</a></li>
      <li><a href="#why-echocardiography-breaks-models">Why Echocardiography Breaks Every Existing Foundation Model</a></li>
      <li><a href="#echojepas-answer">EchoJEPA's Answer</a></li>
      <li><a href="#results">Results: EchoJEPA vs. Competing Methods</a></li>
      <li><a href="#what-this-means-going-forward">What This Means Going Forward</a></li>
      <li><a href="#sources">Sources</a></li>
    </ol>
  </nav>

  <div class="prose">

    <section>
      <h2 id="how-and-by-who">How and by who?</h2>
      <div class="portrait">
        <img src="/img/blogs/echojepa/yann-lecun.jpg" alt="Portrait of Yann LeCun, former Meta Chief AI Scientist and originator of JEPA.">
        <p class="portrait-caption">Yann LeCun, JEPA's originator</p>
      </div>
<p>JEPA (the Joint-Embedding Predictive Architecture) is the brainchild of Yann LeCun, formerly Meta's Chief AI Scientist. His vision is to create machines that can learn <strong>internal models of how the world works</strong>.</p> 
<p>He argues the current generative models and training them with tasks to try to reconstruct every detail of a signal is wasteful and impossible since the actual world is inherently <strong>unpredictable and noisy</strong>(<i>like LLMs with their pretraining step with next predicition token task</i>).</p> 
<p>He draws inspiration of how humans understand the world around them and learn from the environment in terms of abstract and high level representations and ignoring low level details most of the time.</p>
<p>He encourages to build strong foundational models around this thesis and these foundational models will have abstract knowledge of the <strong> environment, physics and planning </strong>. Later more specialized models can be built on top of this like action model for robots or text generation models like current LLMs.</p>
   </section>
   <section>
      <h2 id="what-jepa-actually-predicts">What JEPA actually predicts</h2>
      <p>In JEPA, a model ingests a pair of related inputs;e.g. consecutive video frames or adjacent image patches and encodes each into an <strong>abstract representation</strong>. A predictor module then tries to predict the representation of the "target" input from the representation of the "context" input, bringing them closer in embedding space.</p>
      <p>Unlike generative models, JEPA does not attempt to reconstruct every detail of the input; it works in an abstract embedding space, which lets it focus on <strong>high-level, essential information</strong> and ignore irrelevant or unpredictable details. The model can be viewed as an <strong>Energy-Based Model (EBM)</strong> operating on representations: it assigns low energy when the predicted representation matches the actual target representation, and high energy when they mismatch. The <strong>"joint embedding"</strong> part means both inputs are mapped into a common representation space where the prediction is made, rather than directly predicting raw data.</p>
      <p>From an information-theoretic perspective, the goal is to <strong>capture as much predictable information as possible in the representations while discarding unpredictable noise</strong>. This involves a delicate balance between information preservation and compression: if the representation preserves nearly all information from the input, it may include lots of irrelevant or random detail that makes prediction difficult; if it compresses too aggressively, it may lose the structure needed to predict the target. In other words, JEPA seeks an abstraction level where <strong>the representation has high mutual information with both the input and the target, but low entropy in terms of irrelevant bits</strong>. LeCun's own example is video prediction: trying to predict every pixel of future frames is nearly impossible due to chaotic details like flickering leaves or textured surfaces.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/echojepa/jepa.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/jepa.png" alt="The Joint-Embedding Predictive Architecture: an x-encoder producing s_x and a y-encoder producing s_y, a predictor conditioned on a latent variable z that predicts s_y (as s-tilde-y) from s_x, and an energy function D comparing s_y against the predicted s-tilde-y."></a>
        </div>
        <figcaption class="figure-caption">
          <strong>Figure 1.</strong> The Joint-Embedding Predictive Architecture (JEPA) consists of two encoding branches. The first branch computes s<sub>x</sub>, a representation of x, and the second branch s<sub>y</sub>, a representation of y. The encoders do not need to be identical. A predictor module predicts s<sub>y</sub> from s<sub>x</sub> with the possible help of a latent variable z. The energy is the prediction error. Simple variations of the JEPA may use no predictor, forcing the two representations to be equal, or may use a fixed predictor with no latent, or may use simple latents such as discrete variables.<br><br>
          The main advantage of JEPA is that it performs predictions in representation space, so it doesn't need to predict every detail of y, and irrelevant details can be eliminated by the encoders. More precisely, the main advantage of this architecture for representing multi-modal dependencies is twofold: (1) the encoder function s<sub>y</sub> = Enc(y) may possess invariance properties that will make it produce the same s<sub>y</sub> for a set of different y, so the energy stays constant over that set and the model can capture complex multi-modal dependencies; (2) the latent variable z, when varied over a set &#x1D4B5;, can produce a set of plausible predictions Pred(s<sub>x</sub>, &#x1D4B5;) = {&scaron;<sub>y</sub> = Pred(s<sub>x</sub>, z) &forall; z &isin; &#x1D4B5;}.<br><br>
          If x is a video clip of a car approaching a fork in the road, s<sub>x</sub> and s<sub>y</sub> may represent the position, orientation, velocity and other characteristics of the car before and after the fork, respectively, ignoring irrelevant details such as the trees bordering the road or the texture of the sidewalk. z may represent whether the car takes the left branch or the right branch of the road.<br><br>
          <b>Source:</b> LeCun, <em>A Path Towards Autonomous Machine Intelligence</em> (2022), <a href="https://openreview.net/pdf?id=BZ5a1r-kVsf" target="_blank" rel="noopener">openreview.net/pdf?id=BZ5a1r-kVsf</a>.
        </figcaption>
      </figure>

    </section>

    <section>
      <h2 id="self-supervised-learning-methods">Self-supervised learning methods</h2>
          <p>JEPA didn't invent self-supervised learning; it's a deliberate third option next to two established families, each having its drawback.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/echojepa/jepa-architecture-comparison.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/jepa-architecture-comparison.png" alt="Three architecture diagrams: (a) Joint-Embedding architecture with two encoders and a decoder D(x,y), (b) Generative architecture with an encoder, decoder, and latent z, (c) Joint-Embedding Predictive Architecture with a predictor Pred(x,z) between the two encoders."></a>
        </div>
        <figcaption class="figure-caption"><strong>Figure 2.</strong> Common architectures for self-supervised learning, each assigning low energy to compatible inputs and high energy to incompatible ones. (a) Joint-embedding (invariant) architectures learn to output similar embeddings for compatible inputs x, y. (b) Generative architectures learn to directly reconstruct a signal y from a compatible signal x, via a decoder conditioned on a latent z. (c) Joint-embedding predictive architectures learn to predict the embedding of y from x, via a predictor conditioned on a latent z.<br><br><b>Source:</b> LeCun, <em>A Path Towards Autonomous Machine Intelligence</em> (2022), <a href="https://openreview.net/pdf?id=BZ5a1r-kVsf" target="_blank" rel="noopener">openreview.net/pdf?id=BZ5a1r-kVsf</a>.</figcaption>
      </figure>

      <h3>Invariance-based (joint-embedding) methods</h3>
          <p>Train an encoder to output similar embeddings for different views of the same input, views constructed via hand-crafted data augmentations (random scaling, cropping, color jittering). <strong>The energy landscape is flat for compatible inputs</strong> (low energy regardless of what the encoder outputs), so these methods need tricks to <strong>prevent representation collapse</strong>, where the encoder ignores the input entirely.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/invariance-joint-embedding.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/invariance-joint-embedding.png" alt="Invariance-based joint-embedding diagram: augmented views of the same image (e.g. a dog, a chair) are each passed through a CNN and MLP to produce representations. A repel force pushes apart the representations of different images to prevent collapse."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 3.</strong> An invariance-based joint-embedding setup. Augmented views of the same image are pushed toward similar embeddings; a "repel" term keeps embeddings of different images apart to prevent collapse.<br><br><b>Source:</b> LeCun, <em>A Path Towards Autonomous Machine Intelligence</em> (2022), <a href="https://openreview.net/pdf?id=BZ5a1r-kVsf" target="_blank" rel="noopener">openreview.net/pdf?id=BZ5a1r-kVsf</a>.</figcaption>
          </figure>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Sub-type</th><th>Mechanism</th><th>Examples</th></tr></thead>
              <tbody>
                <tr><td>Contrastive</td><td>Explicitly pushes apart embeddings of negative (incompatible) pairs</td><td><a href="https://arxiv.org/abs/2002.05709" target="_blank" rel="noopener">SimCLR</a>, <a href="https://arxiv.org/abs/1911.05722" target="_blank" rel="noopener">MoCo</a></td></tr>
                <tr><td>Non-contrastive</td><td>Minimizes informational redundancy across embeddings</td><td><a href="https://arxiv.org/abs/2103.03230" target="_blank" rel="noopener">Barlow Twins</a>, <a href="https://arxiv.org/abs/2105.04906" target="_blank" rel="noopener">VICReg</a></td></tr>
                <tr><td>Clustering-based</td><td>Maximizes entropy of the average embedding</td><td><a href="https://arxiv.org/abs/2006.09882" target="_blank" rel="noopener">SwAV</a></td></tr>
                <tr><td>Asymmetric architecture</td><td>Asymmetric x-encoder / y-encoder design to avoid collapse</td><td><a href="https://arxiv.org/abs/2006.07733" target="_blank" rel="noopener">BYOL</a>, <a href="https://arxiv.org/abs/2011.10566" target="_blank" rel="noopener">SimSiam</a></td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 1.</strong> Sub-types of invariance-based (joint-embedding) self-supervised methods.</p>
          </div>
          <p><strong>Limitation:</strong> the hard-coded augmentation invariances may not transfer across tasks or modalities; image classification and segmentation don't need the same invariances.</p>

      <h3>Generative (reconstruction) methods</h3>
          <p>Learn to directly reconstruct signal y from a compatible signal x, using a decoder conditioned on a latent z. Reconstruction collapse isn't a concern here, since the informational capacity of z is kept low.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/generative-reconstruction.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/generative-reconstruction.png" alt="Generative/reconstruction diagram: a masked input image is passed through an encoder to a compact representation, then a decoder reconstructs the full target image directly in pixel space."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 4.</strong> A generative/reconstruction setup. The encoder compresses the (partially masked) input, and a decoder reconstructs the target directly in pixel space.<br><br><b>Source:</b> LeCun, <em>A Path Towards Autonomous Machine Intelligence</em> (2022), <a href="https://openreview.net/pdf?id=BZ5a1r-kVsf" target="_blank" rel="noopener">openreview.net/pdf?id=BZ5a1r-kVsf</a>.</figcaption>
          </figure>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Method</th><th>What is z</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td><a href="https://arxiv.org/abs/2111.06377" target="_blank" rel="noopener">MAE</a></td><td>Position tokens for masked patches</td><td>Encoder only sees visible patches</td></tr>
                <tr><td><a href="https://arxiv.org/abs/2106.08254" target="_blank" rel="noopener">BEiT</a></td><td>Tokenized patch targets (dVAE)</td><td>Predicts discrete tokens, not pixels</td></tr>
                <tr><td><a href="https://arxiv.org/abs/2111.09886" target="_blank" rel="noopener">SimMIM</a></td><td>Raw pixel values</td><td>Simple regression loss; no tokenizer or clustering needed</td></tr>
                <tr><td><a href="https://arxiv.org/abs/2202.03026" target="_blank" rel="noopener">CAE</a></td><td>Encoder + decoder with alignment constraint</td><td>Enforces representation predictability</td></tr>
                <tr><td><a href="https://arxiv.org/abs/2202.03555" target="_blank" rel="noopener">data2vec</a></td><td>Online target encoder representations</td><td>Predicts via masked encoder</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 2.</strong> Generative (reconstruction) methods, compared by what their latent z represents.</p>
          </div>
          <p><strong>Limitation:</strong> because the loss is in pixel/token space, the model is penalized for every low-level mismatch, incentivizing it to model texture and noise rather than semantics.</p>

    </section>

    <section>
      <h2 id="ijepa-first-implementation">I-JEPA: the first concrete implementation</h2>
          <div class="pull-quote">Core principle: what you are forced to predict determines what you learn to represent.</div>
          <p>I-JEPA (Image Joint Embedding Predictive Architecture) is the first concrete implementation of JEPA, for computer vision. The idea is to <strong>predict missing information in an abstract representation</strong> that's more akin to the general understanding people have, rather than in raw pixel space.</p>

          <p>Compared to generative methods that predict in pixel/token space, I-JEPA uses <strong>abstract prediction targets</strong>, for which unnecessary pixel-level details are potentially eliminated, leading the model to learn more semantic features. A second core design choice guiding I-JEPA toward semantic representations is its <strong>multi-block masking strategy</strong>: predicting large blocks containing semantic information (at sufficiently large scale), using an informative, spatially distributed context.</p>

          <p><strong>Put simply:</strong> I-JEPA patchifies the input image, then masks out everything except one large, contiguous context block, and encodes that block with the <strong>context encoder</strong>. In parallel, the <strong>target encoder</strong>, an EMA copy of the context encoder that acts as its stable, slowly-updated twin, encodes the full image and produces representations for four independently sampled target blocks.</p>

          <p>The <strong>predictor</strong> is then asked to predict each target block's representation using only the context encoder's representations, with the target encoder's actual representations serving as ground truth.</p>

          <p>The way I read it: the two encoders' job is to compress the image down to high-level, semantically relevant representations, and <strong>asking the predictor to fill in information about most of the image from a limited context is what injects a generative, fill-in-the-blank pressure into the training objective.</strong></p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/ijepa-context-target.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/ijepa-context-target.png" alt="I-JEPA diagram: a context block is passed through a context encoder, producing a representation. A target encoder processes several target blocks from the full image, and a predictor conditioned on positional information predicts each target block's representation from the context representation."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 5.</strong> I-JEPA's context/target/predictor setup. The context encoder f<sub>&theta;</sub> and target encoder f<sub>&theta;&#772;</sub> map a context block and several target blocks into representation space; a predictor g<sub>&phi;</sub>, conditioned on positional information, predicts each target block's representation from the context block's representation.<br><br><b>Source:</b> <a href="https://arxiv.org/abs/2301.08243" target="_blank" rel="noopener">Assran et al., I-JEPA: Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture</a> (2023).</figcaption>
          </figure>

      <h3>Architecture 1: I-JEPA Architecture</h3>
          <p>The figure above shows the concept; the actual forward pass moves through five components, each with its own tensor shapes. This is the original ViT-H configuration from the I-JEPA paper.</p>

          <div class="diagram-wrap">
            <div class="legend">
              <div class="legend-item"><span class="swatch module"></span>module / op</div>
              <div class="legend-item"><span class="swatch repeat"></span>repeated block (transformer layers)</div>
              <div class="legend-item"><span class="swatch flow"></span>tensor flow, labeled with shape</div>
              <div class="legend-item"><span class="swatch add"></span>&oplus; elementwise add</div>
            </div>
            <figure>
<svg viewBox="0 0 1000 1264" role="img" aria-label="I-JEPA architecture: an image is patchified and linearly projected into 256 tokens of dimension 1280. A context block is sampled, given sincos positional encoding, and encoded by the ViT-H context encoder into context representations s_x. The full unmasked image is separately encoded by an EMA copy of the same ViT-H (the target encoder, which receives no gradients), then four target blocks are selected and layer-normalized into target representations s_y. A narrow 12-layer, 384-dim predictor takes the context representations plus learned mask tokens with positional embeddings and predicts s_y as s_y-hat. An L2 loss between s_y-hat and s_y updates only the context encoder and predictor. Each box links to a fuller explanation below the diagram.">
<defs>
  <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="10" height="10" fill="var(--d-container-bg)"/>
    <line x1="0" y1="0" x2="0" y2="10" stroke="var(--d-container-line)" stroke-width="2"/>
  </pattern>
  <filter id="rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="393.4,20 606.6,20 618.3,66 381.7,66" filter="url(#rough)"/>
<text x="500" y="48.0" class="lbl" text-anchor="middle">Input Image</text>
<text x="645" y="43" class="sub" text-anchor="start">224×224×3</text>
<line x1="500" y1="66" x2="500" y2="106" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="441.9" y="75" width="116.2" height="22" rx="6" class="shapepill"/>
<text x="500" y="90" class="shapetxt" text-anchor="middle">[224, 224, 3]</text>
<a href="#comp-1" id="diagram-comp-1">
<rect class="proc" x="280.0" y="106" width="440" height="64" rx="10" filter="url(#rough)"/>
<text x="500" y="134.0" class="lbl" text-anchor="middle">Patchify &amp; Linear Projection</text>
<text x="500" y="154.0" class="sub" text-anchor="middle">Conv2d(3, 1280, kernel=14, stride=14)</text>
</a>
<line x1="500" y1="170" x2="500" y2="210" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="453.0" y="179" width="94.0" height="22" rx="6" class="shapepill"/>
<text x="500" y="194" class="shapetxt" text-anchor="middle">256 × 1280</text>
<polygon class="term" points="360.6,210 639.4,210 654.7,260 345.3,260" filter="url(#rough)"/>
<text x="500" y="240.0" class="lbl" text-anchor="middle">Patch Tokens: 256 × 1280</text>
<line x1="500" y1="260" x2="500" y2="276" class="arrow" marker-end="url(#arrowhead)"/>
<circle cx="500" cy="295" r="19" class="addnode" filter="url(#rough)"/>
<text x="500" y="302" class="addsym" text-anchor="middle">&#8853;</text>
<text x="530" y="300" class="skiplbl" text-anchor="start">sincos positional encoding, all 256 tokens</text>
<line x1="500" y1="314" x2="500" y2="330" class="arrow" marker-end="url(#arrowhead)"/>
<line x1="500" y1="330" x2="240" y2="376" class="arrow" marker-end="url(#arrowhead)"/>
<line x1="500" y1="330" x2="700" y2="376" class="arrow" marker-end="url(#arrowhead)"/>
<text x="210" y="348" class="sub" text-anchor="middle">context branch</text>
<text x="730" y="348" class="sub" text-anchor="middle">target branch</text>
<a href="#comp-context-block" id="diagram-comp-context-block">
<rect class="proc" x="70.0" y="376" width="340" height="64" rx="10" filter="url(#rough)"/>
<text x="240" y="404.0" class="lbl" text-anchor="middle">Sample 1 Context Block</text>
<text x="240" y="424.0" class="sub" text-anchor="middle">scale 0.85:1.0, unit aspect ratio</text>
</a>
<line x1="240" y1="440" x2="240" y2="474" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="189.3" y="446" width="101.4" height="22" rx="6" class="shapepill"/>
<text x="240" y="461" class="shapetxt" text-anchor="middle">~220 × 1280</text>
<a href="#comp-2" id="diagram-comp-2">
<rect class="ghost" x="71.0" y="453.0" width="380" height="130" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="64.0" y="460.0" width="380" height="130" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="57.0" y="467.0" width="380" height="130" rx="18" filter="url(#rough)"/>
<rect class="containerOuter" x="50.0" y="474" width="380" height="130" rx="18" filter="url(#rough)"/>
<text x="70.0" y="502" class="clbl">Context Encoder (f)</text>
<text x="240" y="541.0" class="lbl" text-anchor="middle">ViT-H Transformer</text>
<text x="240" y="561.0" class="sub" text-anchor="middle">32 layers · 16 heads · dim 1280</text>
</a>
<line x1="240" y1="604" x2="240" y2="638" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="185.6" y="610" width="108.8" height="22" rx="6" class="shapepill"/>
<text x="240" y="625" class="shapetxt" text-anchor="middle">N_ctx × 1280</text>
<polygon class="term" points="92.4,638 387.6,638 403.8,692 76.2,692" filter="url(#rough)"/>
<text x="240" y="670.0" class="lbl" text-anchor="middle">s_x: context representations</text>
<polygon class="term" points="552.4,376 847.6,376 863.8,426 536.2,426" filter="url(#rough)"/>
<text x="700" y="406.0" class="lbl" text-anchor="middle">Full image tokens: 256 × 1280</text>
<line x1="700" y1="426" x2="700" y2="460" class="arrow" marker-end="url(#arrowhead)"/>
<a href="#comp-4" id="diagram-comp-4">
<rect class="ghost" x="531.0" y="439.0" width="380" height="115" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="524.0" y="446.0" width="380" height="115" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="517.0" y="453.0" width="380" height="115" rx="18" filter="url(#rough)"/>
<rect class="containerOuter" x="510.0" y="460" width="380" height="115" rx="18" filter="url(#rough)"/>
<text x="530.0" y="488" class="clbl">Target Encoder (f-ema)</text>
<text x="700" y="519.5" class="lbl" text-anchor="middle">same ViT-H architecture</text>
</a>
<line x1="700" y1="575" x2="700" y2="609" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="653.0" y="581" width="94.0" height="22" rx="6" class="shapepill"/>
<text x="700" y="596" class="shapetxt" text-anchor="middle">256 × 1280</text>
<a href="#comp-target-blocks" id="diagram-comp-target-blocks">
<rect class="proc" x="500.0" y="609" width="400" height="64" rx="10" filter="url(#rough)"/>
<text x="700" y="637.0" class="lbl" text-anchor="middle">Select 4 Target Blocks</text>
<text x="700" y="657.0" class="sub" text-anchor="middle">scale 0.15:0.20, aspect ratio 0.75:1.5 each</text>
</a>
<line x1="700" y1="673" x2="700" y2="707" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="630.8" y="679" width="138.4" height="22" rx="6" class="shapepill"/>
<text x="700" y="694" class="shapetxt" text-anchor="middle">M × N_tgt × 1280</text>
<rect class="proc" x="530.0" y="707" width="340" height="54" rx="10" filter="url(#rough)"/>
<text x="700" y="739.0" class="lbl" text-anchor="middle">LayerNorm over feature dim</text>
<line x1="700" y1="761" x2="700" y2="795" class="arrow" marker-end="url(#arrowhead)"/>
<polygon class="term" points="513.9,795 886.1,795 906.6,849 493.4,849" filter="url(#rough)"/>
<text x="700" y="827.0" class="lbl" text-anchor="middle">s_y: target representations (normalized)</text>
<path d="M 240 692 C 240 727, 280 859, 330 896" class="arrow" marker-end="url(#arrowhead)"/>
<text x="255" y="722" class="shapetxt" text-anchor="start">s_x, N_ctx × 1280</text>
<text x="751" y="926" class="sub" text-anchor="start">+ mask tokens,</text>
<text x="751" y="942" class="sub" text-anchor="start">own 384-d pos. embed</text>
<a href="#comp-5" id="diagram-comp-5">
<rect class="ghost" x="261.0" y="883.0" width="480" height="100" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="254.0" y="890.0" width="480" height="100" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="247.0" y="897.0" width="480" height="100" rx="18" filter="url(#rough)"/>
<rect class="containerOuter" x="240.0" y="904" width="480" height="100" rx="18" filter="url(#rough)"/>
<text x="260.0" y="932" class="clbl">Predictor (g)</text>
<text x="480" y="956.0" class="lbl" text-anchor="middle">Narrow ViT</text>
<text x="480" y="976.0" class="sub" text-anchor="middle">12 layers · 16 heads · dim 384</text>
</a>
<line x1="480" y1="1004" x2="480" y2="1038" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="425.6" y="1010" width="108.8" height="22" rx="6" class="shapepill"/>
<text x="480" y="1025" class="shapetxt" text-anchor="middle">N_tgt × 1280</text>
<polygon class="term" points="304.4,1038 655.6,1038 674.8,1092 285.2,1092" filter="url(#rough)"/>
<text x="480" y="1070.0" class="lbl" text-anchor="middle">ŝ_y: predicted target representations</text>
<line x1="480" y1="1092" x2="480" y2="1144" class="arrow" marker-end="url(#arrowhead)"/>
<a href="#comp-loss" id="diagram-comp-loss">
<rect x="235.0" y="1152" width="490" height="92" rx="14" fill="var(--d-paper)" stroke="var(--d-red)" stroke-width="2.4" filter="url(#rough)"/>
<text x="480" y="1184" class="lbl" text-anchor="middle">D(ŝ_y, s_y) = avg. L2 distance on N_tgt slots only</text>
<text x="480" y="1208" class="sub" text-anchor="middle">Backprop updates the context encoder and predictor only.</text>
<text x="480" y="1226" class="sub" text-anchor="middle">The target encoder gets an EMA update: no gradients flow into it.</text>
</a>
<path d="M 917.0 831 C 1057.0 871, 865.0 1072, 711.0 1182" class="arrow" marker-end="url(#arrowhead)"/>
<text x="964" y="991.5" class="shapetxt" text-anchor="middle">s_y</text>
</svg>
              <figcaption>
                <dl>
                  <dt id="comp-1"><a href="#diagram-comp-1">Patchify</a></dt>
                  <dd>
                    <ul>
                      <li>224&times;224&times;3 image &rarr; 16&times;16 grid of 14&times;14 patches (224 / 14 = 16 per side, 256 patches total)</li>
                      <li>Each patch is flattened to 14&times;14&times;3 = 588 values</li>
                      <li>Linearly projected to width 1280 via <code>Conv2d(3, 1280, kernel=14, stride=14)</code>, equivalent to one <code>Linear(588 &rarr; 1280)</code> per patch</li>
                      <li>A sincos positional encoding is added elementwise (&oplus;) to all 256 tokens, before either branch splits off</li>
                    </ul>
                  </dd>

                  <dt id="comp-context-block"><a href="#diagram-comp-context-block">Context Block</a></dt>
                  <dd>
                    <ul>
                      <li>One region is sampled directly from the 16&times;16 patch grid: scale 0.85:1.0 of the image (almost the whole image), unit aspect ratio</li>
                      <li>This crop happens before encoding: the context encoder only ever sees these patches, never the rest of the image</li>
                      <li>Patches inside any of the four target blocks are removed, so the model can't trivially copy overlapping content; that leaves roughly N_ctx &asymp; 220 of the original 256 patches</li>
                      <li>The result is one large, spatially-distributed context region, not a scattering of isolated patches</li>
                    </ul>
                    <figure class="figure">
                      <div class="figure-frame">
                        <a href="/img/blogs/echojepa/context_targets.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/context_targets.png" alt="Original image of a dog, next to the sampled context block with the four target regions blacked out, next to four separate views each showing one target block highlighted."></a>
                      </div>
                      <figcaption class="figure-caption"><strong>Figure 6.</strong> Sample of Context block and the 4 target blocks.</figcaption>
                    </figure>
                  </dd>

                  <dt id="comp-2"><a href="#diagram-comp-2">Context Encoder (f)</a></dt>
                  <dd>
                    <ul>
                      <li>Takes the sampled context block's patches, already carrying their positional encoding from the patchify step</li>
                      <li>Passes through the full ViT-H: 32 layers, 16 attention heads of dimension 1280 / 16 = 80 each</li>
                      <li>Output: context representations s_x &isin; &#8477;<sup>N_ctx &times; 1280</sup></li>
                    </ul>
                  </dd>

                  <dt id="comp-4"><a href="#diagram-comp-4">Target Encoder (f_ema)</a></dt>
                  <dd>
                    <ul>
                      <li>Architecturally identical to the context encoder, and uses the <em>same</em> positionally-encoded tokens from the patchify step, so yes, it gets positional encoding too</li>
                      <li>Weights are never touched by gradient descent, only by <a href="#target-encoder-ema-and-the-loss">the exponential moving average shown below</a></li>
                      <li>Encodes the <em>full, unmasked</em> 256-token image, unlike the context encoder, which only ever sees the sampled context block</li>
                      <li>Output: full-image representations, 256 &times; 1280</li>
                    </ul>
                  </dd>

                  <dt id="comp-target-blocks"><a href="#diagram-comp-target-blocks">Target Blocks</a></dt>
                  <dd>
                    <ul>
                      <li>Four blocks are sampled independently: scale 0.15:0.20 of the image each, aspect ratio 0.75:1.5, roughly 38&ndash;51 patches per block</li>
                      <li>Unlike the context block, target blocks are selected after the target encoder has already processed the full image, by reading the corresponding rows out of its full-image representation</li>
                      <li>That ordering matters: the target encoder's representations are computed with full context, so they stay stable regardless of exactly where a target block lands</li>
                      <li>Layer-normalized into target representations s_y &isin; &#8477;<sup>M &times; N_tgt &times; 1280</sup>, the actual prediction targets</li>
                    </ul>
                  </dd>

                  <dt id="comp-5"><a href="#diagram-comp-5">Predictor (g)</a></dt>
                  <dd>
                    <ul>
                      <li>Context representations are projected down: <code>Linear(1280 &rarr; 384)</code>. Yes, it gets positional encoding too, but a <em>separate</em> one from the encoders': the predictor works in a narrower 384-dim space, so it re-embeds positions at that width rather than reusing the 1280-dim encoding</li>
                      <li><strong>One learned mask token per target patch</strong> is concatenated on, carrying only that same 384-dim positional embedding for where the patch sits: mask tokens carry no image content, only positional embeddings indicating which patches to predict</li>
                      <li>Combined sequence runs through 12 layers of 16-head self-attention at width 384 (head dim 384 / 16 = 24), letting mask tokens attend to the visible context tokens</li>
                      <li>Mask-token outputs are kept and projected back up: <code>Linear(384 &rarr; 1280)</code>, producing &scaron;_y</li>
                      <li><strong>Bottleneck at 384-dim:</strong> the predictor is intentionally narrow (384 vs. 1280 in the encoder). It must be cheap since it runs M = 4 times per image, one per target block, and the bottleneck actually improves downstream performance</li>
                    </ul>
                    <div class="diagram-wrap is-compact">
                      <figure>
<svg viewBox="0 0 660 689" role="img" aria-label="Predictor internals: context representations are projected from 1280 to 384 dimensions and given positional encoding for their context positions; a single learned mask token is broadcast to N_tgt copies and given positional encoding for the target positions; the two sequences are concatenated and passed through a 12-layer, 384-dim transformer; only the mask-token outputs are kept and projected back up to 1280 dimensions to produce the predicted target representations.">
<defs>
  <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.014 0.03" numOctaves="2" seed="11" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.6" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="127.5,16 332.5,16 343.8,74 116.2,74" filter="url(#rough)"/>
<text x="230" y="42.0" class="lbl" text-anchor="middle" style="font-size:12px">s_x: context reps</text>
<text x="230" y="59.0" class="sub" text-anchor="middle" style="font-size:10px">N_ctx × 1280</text>
<line x1="230" y1="74" x2="230" y2="104" class="arrow" marker-end="url(#arrowhead)"/>
<rect class="proc" x="90.0" y="104" width="280" height="50" rx="9" filter="url(#rough)"/>
<text x="230" y="125.0" class="lbl" text-anchor="middle" style="font-size:12px">Project down</text>
<text x="230" y="142.0" class="sub" text-anchor="middle" style="font-size:10px">Linear(1280 → 384)</text>
<line x1="230" y1="154" x2="230" y2="182" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="183.6" y="158" width="92.8" height="20" rx="5" class="shapepill"/>
<text x="230" y="171.5" class="shapetxt" text-anchor="middle" style="font-size:11px">N_ctx × 384</text>
<line x1="230" y1="182" x2="230" y2="193" class="arrow" marker-end="url(#arrowhead)"/>
<circle cx="230" cy="208" r="15" class="addnode" filter="url(#rough)"/>
<text x="230" y="213.5" class="addsym" text-anchor="middle" style="font-size:15px">&#8853;</text>
<text x="254" y="212" class="skiplbl" text-anchor="start" style="font-size:10.5px">sincos pos embed</text>
<text x="254" y="226" class="skiplbl" text-anchor="start" style="font-size:10.5px">(context positions)</text>
<line x1="230" y1="223" x2="230" y2="240" class="arrow" marker-end="url(#arrowhead)"/>
<polygon class="term" points="438.0,16 602.0,16 611.0,74 429.0,74" filter="url(#rough)"/>
<text x="520" y="42.0" class="lbl" text-anchor="middle" style="font-size:12px">Mask token</text>
<text x="520" y="59.0" class="sub" text-anchor="middle" style="font-size:10px">nn.Parameter(1,1,384)</text>
<line x1="520" y1="74" x2="520" y2="96" class="arrow" marker-end="url(#arrowhead)"/>
<rect class="proc" x="425.0" y="96" width="190" height="46" rx="9" filter="url(#rough)"/>
<text x="520" y="115.0" class="lbl" text-anchor="middle" style="font-size:12px">Broadcast</text>
<text x="520" y="132.0" class="sub" text-anchor="middle" style="font-size:10px">to N_tgt copies</text>
<line x1="520" y1="142" x2="520" y2="152" class="arrow" marker-end="url(#arrowhead)"/>
<circle cx="520" cy="167" r="15" class="addnode" filter="url(#rough)"/>
<text x="520" y="172.5" class="addsym" text-anchor="middle" style="font-size:15px">&#8853;</text>
<text x="496" y="187" class="skiplbl" text-anchor="end" style="font-size:10.5px">sincos pos embed</text>
<text x="496" y="201" class="skiplbl" text-anchor="end" style="font-size:10.5px">(target positions)</text>
<line x1="520" y1="182" x2="520" y2="219" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="473.6" y="209" width="92.8" height="20" rx="5" class="shapepill"/>
<text x="520" y="222.5" class="shapetxt" text-anchor="middle" style="font-size:11px">N_tgt × 384</text>
<path d="M 520 229 C 520 249, 390 229, 325 261" class="arrow" marker-end="url(#arrowhead)"/>
<rect class="proc" x="80.0" y="240" width="300" height="60" rx="9" filter="url(#rough)"/>
<text x="230" y="266.0" class="lbl" text-anchor="middle" style="font-size:12px">Concatenate</text>
<text x="230" y="283.0" class="sub" text-anchor="middle" style="font-size:10px">torch.cat along sequence dim</text>
<text x="230" y="297.0" class="sub" text-anchor="middle" style="font-size:10px">(N_ctx+N_tgt) × 384</text>
<line x1="230" y1="300" x2="230" y2="344" class="arrow" marker-end="url(#arrowhead)"/>
<rect class="ghost" x="118.0" y="326.0" width="260" height="85" rx="14" filter="url(#rough)"/>
<rect class="ghost" x="112.0" y="332.0" width="260" height="85" rx="14" filter="url(#rough)"/>
<rect class="ghost" x="106.0" y="338.0" width="260" height="85" rx="14" filter="url(#rough)"/>
<rect class="containerOuter" x="100.0" y="344" width="260" height="85" rx="14" filter="url(#rough)"/>
<text x="116.0" y="366" class="clbl" style="font-size:11px">Predictor Transformer</text>
<text x="230" y="390.5" class="lbl" text-anchor="middle" style="font-size:12px">Narrow ViT</text>
<text x="230" y="408.5" class="sub" text-anchor="middle" style="font-size:10px">12 layers · 16 heads · dim 384</text>
<line x1="230" y1="429" x2="230" y2="469" class="arrow" marker-end="url(#arrowhead)"/>
<rect class="proc" x="80.0" y="469" width="300" height="50" rx="9" filter="url(#rough)"/>
<text x="230" y="490.0" class="lbl" text-anchor="middle" style="font-size:12px">Select mask positions only</text>
<text x="230" y="507.0" class="sub" text-anchor="middle" style="font-size:10px">x = x[:, N_ctx:]</text>
<line x1="230" y1="519" x2="230" y2="547" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="183.6" y="523" width="92.8" height="20" rx="5" class="shapepill"/>
<text x="230" y="536.5" class="shapetxt" text-anchor="middle" style="font-size:11px">N_tgt × 384</text>
<rect class="proc" x="90.0" y="547" width="280" height="50" rx="9" filter="url(#rough)"/>
<text x="230" y="568.0" class="lbl" text-anchor="middle" style="font-size:12px">Project up</text>
<text x="230" y="585.0" class="sub" text-anchor="middle" style="font-size:10px">Linear(384 → 1280)</text>
<line x1="230" y1="597" x2="230" y2="627" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="180.2" y="602" width="99.6" height="20" rx="5" class="shapepill"/>
<text x="230" y="615.5" class="shapetxt" text-anchor="middle" style="font-size:11px">N_tgt × 1280</text>
<polygon class="term" points="107.0,627 353.0,627 366.5,669 93.5,669" filter="url(#rough)"/>
<text x="230" y="652.0" class="lbl" text-anchor="middle" style="font-size:12px">ŝ_y: predicted target reps</text>
</svg>
                      <figcaption class="figure-caption"><strong>Architecture 2.</strong> Predictor in detail.</figcaption>
                      </figure>
                    </div>
                  </dd>

                  <dt id="comp-loss"><a href="#diagram-comp-loss">Loss</a></dt>
                  <dd>
                    <div class="formula">$$D(\hat{s}_y, s_y) = \frac{1}{N_{\text{tgt}}}\sum \left\| \hat{s}_y - s_y \right\|_2^2$$</div>
                    <ul>
                      <li>Average squared L2 distance between predicted and target representations, computed only over the target patches</li>
                      <li>Gradients update the context encoder and predictor only</li>
                      <li>The target encoder is never backpropagated through: see the next section for exactly how it's updated instead</li>
                    </ul>
                  </dd>
                </dl>
              </figcaption>
            </figure>
            <footer>
              Source: <a href="https://arxiv.org/abs/2301.08243" target="_blank" rel="noopener">Assran et al., I-JEPA: Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture</a> (2023).
            </footer>
          </div>

      <h3 id="target-encoder-ema-and-the-loss">Target encoder EMA and the loss</h3>
          <ul>
            <li>At the start of training, the target encoder is <strong>a direct weight copy</strong> of the context encoder: every parameter tensor duplicated (patch projection, positional embeddings, all 32 transformer layers).</li>
            <li>Each training step has two phases: the context encoder gets a <strong>gradient update</strong>, then the target encoder gets an <strong>EMA update</strong>:
              <div class="formula">$$\theta_{\text{ema}} \leftarrow m \cdot \theta_{\text{ema}} + (1 - m) \cdot \theta_{\text{context}}$$</div>
            </li>
            <li>&theta;<sub>ema</sub> is the current theta value, m is the momentum, &theta;<sub>context</sub> is the new context-encoder value. With <strong>m&nbsp;=&nbsp;0.996</strong>, that's a weighted average of all past context-encoder states, with exponentially decaying weights for older states:
              <div class="formula">$$\theta_{\text{ema}} \leftarrow 0.996 \cdot \theta_{\text{ema}} + 0.004 \cdot \theta_{\text{context}}$$</div>
            </li>
            <li>Momentum doesn't stay fixed: it <strong>ramps linearly from 0.996 to 1.0</strong> over the full training run.
              <ul>
                <li><strong>Early in training</strong> (m&nbsp;=&nbsp;0.996, a window of roughly 250 steps): the target encoder can change quickly to escape its random initialization, so targets aren't permanently anchored to noise.</li>
                <li><strong>Late in training</strong> (m&nbsp;&rarr;&nbsp;1.0, window&nbsp;&rarr;&nbsp;infinity): representations have become semantic and stable, and freezing the targets gives the predictor a clean, consistent signal to converge on.</li>
              </ul>
            </li>
            <li>The loss is the <strong>average L2 distance</strong> between each predicted patch-level representation and the corresponding target patch-level representation:
              <div class="formula">$$\frac{1}{M}\sum_{i=1}^{M} D(\hat{s}_y(i), s_y(i)) \;=\; \frac{1}{M}\sum_{i=1}^{M}\sum_{j \in B_i} \left\| \hat{s}_{y_j} - s_{y_j} \right\|_2^2$$</div>
            </li>
            <li>The parameters of the predictor (&phi;) and the context encoder (&theta;) are learned through <strong>gradient-based optimization</strong>, while the parameters of the target encoder (&theta;&#772;) are updated only via the <strong>exponential moving average</strong> above.</li>
          </ul>

          <div class="note">
            <strong class="note-label">Note</strong>
            It's the <strong>target</strong> encoder that's used for all downstream tasks, not the context encoder.
          </div>

      <details class="collapsible">
        <summary><h3 id="ijepa-performance">I-JEPA Performance</h3></summary>

      <h4>Linear probing</h4>
          <p>Linear probing is a standard evaluation protocol to measure pretrained representation quality <strong>without allowing the model to adapt to the new task</strong>. Procedure:</p>
          <ul>
            <li>Freeze the pretrained encoder (zero weight updates)</li>
            <li>Pass all training images through the frozen encoder to extract representations (for I-JEPA, average-pooled patch representations from the last layer)</li>
            <li>Train a single linear layer (plus softmax) on top of those frozen representations</li>
            <li>Evaluate accuracy on the test set</li>
          </ul>
          <p>The <strong>transfer</strong> part means the encoder was pretrained on one dataset (ImageNet) and the linear classifier is evaluated on a different dataset: CIFAR-100, Places205, and iNat18.</p>
          <p><strong>Why it matters:</strong> a linear classifier can only separate classes if they are already <strong>linearly separable in representation space</strong>. This directly measures how semantically structured the representations are; low-level texture features will not be linearly separable by category, but high-level semantic features will be. Fine-tuning would allow the model to compensate for poor representations by updating weights, which <strong>masks representation quality</strong>.</p>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Method</th><th>Arch.</th><th>CIFAR100</th><th>Places205</th><th>iNat18</th></tr></thead>
              <tbody>
                <tr><td colspan="5"><em>Methods without view data augmentations</em></td></tr>
                <tr><td>data2vec</td><td>ViT-L/16</td><td>81.6</td><td>54.6</td><td>28.1</td></tr>
                <tr><td>MAE</td><td>ViT-H/14</td><td>77.3</td><td>55.0</td><td>32.9</td></tr>
                <tr><td>I-JEPA</td><td>ViT-H/14</td><td class="hl">87.5</td><td class="hl">58.4</td><td class="hl">47.6</td></tr>
                <tr><td colspan="5"><em>Methods using extra view data augmentations</em></td></tr>
                <tr><td><a href="https://arxiv.org/abs/2104.14294" target="_blank" rel="noopener">DINO</a></td><td>ViT-B/8</td><td>84.9</td><td>57.9</td><td>55.9</td></tr>
                <tr><td><a href="https://arxiv.org/abs/2111.07832" target="_blank" rel="noopener">iBOT</a></td><td>ViT-L/16</td><td>88.3</td><td>60.4</td><td>57.3</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 3. Linear-probe transfer for image classification.</strong> I-JEPA significantly outperforms previous methods that also do not use augmentations (MAE and data2vec), and decreases the gap with the best view-invariance-based methods that leverage hand-crafted data augmentations during pretraining.</p>
          </div>

      <h4>Fine tuning</h4>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Method</th><th>Arch.</th><th>Epochs</th><th>Top-1</th></tr></thead>
              <tbody>
                <tr><td colspan="4"><em>Methods without view data augmentations</em></td></tr>
                <tr><td>data2vec</td><td>ViT-L/16</td><td>1600</td><td>77.3</td></tr>
                <tr><td>MAE</td><td>ViT-B/16</td><td>1600</td><td>68.0</td></tr>
                <tr><td>MAE</td><td>ViT-L/16</td><td>1600</td><td>76.0</td></tr>
                <tr><td>MAE</td><td>ViT-H/14</td><td>1600</td><td>77.2</td></tr>
                <tr><td>CAE</td><td>ViT-B/16</td><td>1600</td><td>70.4</td></tr>
                <tr><td>CAE</td><td>ViT-L/16</td><td>1600</td><td>78.1</td></tr>
                <tr><td>I-JEPA</td><td>ViT-B/16</td><td>600</td><td>72.9</td></tr>
                <tr><td>I-JEPA</td><td>ViT-L/16</td><td>600</td><td>77.5</td></tr>
                <tr><td>I-JEPA</td><td>ViT-H/14</td><td>300</td><td>79.3</td></tr>
                <tr><td>I-JEPA</td><td>ViT-H/16<sub>448</sub></td><td>300</td><td class="hl">81.1</td></tr>
                <tr><td colspan="4"><em>Methods using extra view data augmentations</em></td></tr>
                <tr><td>SimCLR v2</td><td>RN152 (2&times;)</td><td>800</td><td>79.1</td></tr>
                <tr><td>DINO</td><td>ViT-B/8</td><td>300</td><td>80.1</td></tr>
                <tr><td>iBOT</td><td>ViT-L/16</td><td>250</td><td>81.0</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 4. ImageNet.</strong> Linear-evaluation on ImageNet-1k (the ViT-H/16<sub>448</sub> is pretrained at a resolution of 448&times;448). I-JEPA improves linear probing performance compared to other methods that do not rely on hand-crafted view data-augmentations during pretraining, and demonstrates good scalability; the larger I-JEPA model matches the performance of view-invariance approaches without requiring view data-augmentations.</p>
          </div>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Method</th><th>Arch.</th><th>Epochs</th><th>Top-1</th></tr></thead>
              <tbody>
                <tr><td colspan="4"><em>Methods without view data augmentations</em></td></tr>
                <tr><td>data2vec</td><td>ViT-L/16</td><td>1600</td><td>73.3</td></tr>
                <tr><td>MAE</td><td>ViT-L/16</td><td>1600</td><td>67.1</td></tr>
                <tr><td>MAE</td><td>ViT-H/14</td><td>1600</td><td>71.5</td></tr>
                <tr><td>I-JEPA</td><td>ViT-L/16</td><td>600</td><td>69.4</td></tr>
                <tr><td>I-JEPA</td><td>ViT-H/14</td><td>300</td><td>73.3</td></tr>
                <tr><td>I-JEPA</td><td>ViT-H/16<sub>448</sub></td><td>300</td><td class="hl">77.3</td></tr>
                <tr><td colspan="4"><em>Methods using extra view data augmentations</em></td></tr>
                <tr><td>iBOT</td><td>ViT-B/16</td><td>400</td><td>69.7</td></tr>
                <tr><td>DINO</td><td>ViT-B/8</td><td>300</td><td>70.0</td></tr>
                <tr><td>SimCLR v2</td><td>RN151 (2&times;)</td><td>800</td><td>70.2</td></tr>
                <tr><td>BYOL</td><td>RN200 (2&times;)</td><td>800</td><td>71.2</td></tr>
                <tr><td>MSN</td><td>ViT-B/4</td><td>300</td><td>75.7</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 5. ImageNet-1%.</strong> Semi-supervised evaluation on ImageNet-1K using only 1% of the available labels; models are adapted via fine-tuning or linear-probing, whichever works best for each method. I-JEPA outperforms MAE, which also does not rely on hand-crafted data-augmentations during pretraining, and benefits from scale; a ViT-H/16 trained at resolution 448 surpasses previous methods including ones that leverage extra hand-crafted data-augmentations.</p>
          </div>

          <p>As the linear probing and fine-tuning results above show, I-JEPA outperforms other methods, whether they are generative or joint-embedding architecture based.</p>

      </details>

    </section>

    <section>
      <h2 id="the-lineage">Journey to EchoJEPA</h2>
      <p>How did JEPA reach Echo? It's a long journey, from 2022 to 2026: from images, to motion, to video, to adapting video pretraining for echocardiography.</p>

      <ol class="timeline">
        <li class="timeline-item">
          <div class="timeline-date">2022</div>
          <h3 class="timeline-title"><a href="https://openreview.net/pdf?id=BZ5a1r-kVsf" target="_blank" rel="noopener">A Path Towards Autonomous Machine Intelligence</a></h3>
          <p class="timeline-desc">LeCun's vision for next-generation AI, with JEPA as a central component. Proposes a six-module architecture (perception, world model, cost, memory, action, configurator) and argues that a non-generative, joint-embedding world model can learn hierarchical representations of the world.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2023</div>
          <h3 class="timeline-title"><a href="https://arxiv.org/abs/2301.08243" target="_blank" rel="noopener">I-JEPA: images</a></h3>
          <p class="timeline-desc">The first concrete implementation of JEPA for computer vision.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2023</div>
          <h3 class="timeline-title"><a href="https://arxiv.org/abs/2307.12698" target="_blank" rel="noopener">MC-JEPA: motion + content</a></h3>
          <p class="timeline-desc">Extends JEPA to video by jointly learning two kinds of representations: one for static content (objects/appearance) and one for motion (optical flow).</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2024</div>
          <h3 class="timeline-title"><a href="https://arxiv.org/abs/2404.08471" target="_blank" rel="noopener">V-JEPA: revisiting feature prediction for video</a></h3>
          <p class="timeline-desc">The first large-scale video-based JEPA model. Trains on a massive set of 2+ million unlabelled videos, using only the feature prediction objective: no contrastive pairs, no text or labels, no pretrained image encoder.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2025</div>
          <h3 class="timeline-title"><a href="https://arxiv.org/abs/2502.11831" target="_blank" rel="noopener">Emergent results: intuitive physics from video prediction</a></h3>
          <p class="timeline-desc">A V-JEPA model can develop a rudimentary "intuitive physics" understanding; it emerges from self-supervised pretraining on natural videos.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2025</div>
          <h3 class="timeline-title"><a href="https://arxiv.org/abs/2506.09985" target="_blank" rel="noopener">V-JEPA2</a></h3>
          <p class="timeline-desc">The scaling step: a ViT-g/16 (~1B params) trained on VideoMix22M (~22 million videos), with 3D RoPE positional encoding and a fixed EMA momentum. Its recipe (architecture, masking, and loss) is inherited directly by EchoJEPA.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2026</div>
          <h3 class="timeline-title"><a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA: the heart</a></h3>
          <p class="timeline-desc">A foundation model trained on 18 million echocardiograms across 300K patients, representing the largest pretraining corpus for this modality to date. By leveraging a latent predictive objective, EchoJEPA learns robust anatomical representations that ignore speckle noise.</p>
        </li>
      </ol>

    </section>

    <section>
      <h2 id="ijepa-vjepa2-echojepa-changes">What changed from I-JEPA to V-JEPA 2 to EchoJEPA</h2>
      <h3>From patches to tubelets</h3>
          <p>V-JEPA 2 uses <strong>tubelets</strong>: small 3D cuboids that span 2 frames temporally and 16&times;16 pixels spatially. A single <code>Conv3d(3, embed_dim, kernel=(2,16,16), stride=(2,16,16))</code> implements this: identical idea to I-JEPA's <code>Conv2d</code> patch projection, just with one extra dimension.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/vjepa-initial-block.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/vjepa-initial-block.png" alt="V-JEPA initial block diagram: 16 video frames at 224x224 pass through a 3D convolution producing an 8x14x14xd grid, which is added to 3D sin-cos absolute position embeddings and flattened into a 1568xd token sequence."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 7.</strong> V-JEPA's initial block. 16 video frames at 224&times;224 resolution pass through a 3D convolution that produces an 8&times;14&times;14&times;d grid of tubelet embeddings, which are added to 3D sin-cos absolute position embeddings and flattened into a 1568&times;d token sequence.<br><br><b>Source:</b> Meta AI, <em>V-JEPA 2</em> (2025), <a href="https://arxiv.org/abs/2506.09985" target="_blank" rel="noopener">arxiv.org/abs/2506.09985</a>.</figcaption>
          </figure>

          <p>A second, standard-pretraining worked example from the deck, at 256&times;256 resolution:</p>
          <div class="formula">Input video x : (3, 16, 256, 256)&nbsp;&nbsp;&nbsp;# (C, T, H, W)<br>Tubelet size&nbsp; : (2, 16, 16)<br><br>Grid dims:<br>&nbsp;&nbsp;T' = 16 / 2&nbsp; = 8<br>&nbsp;&nbsp;H' = 256/16&nbsp; = 16<br>&nbsp;&nbsp;W' = 256/16&nbsp; = 16<br><br>N_tokens = T' * H' * W' = 8 * 16 * 16 = 2048 tokens</div>
          <p>Each tubelet passes through the <code>Conv3d</code> patch embedder and is projected to the encoder width (e.g., 1408 for ViT-g). The resulting token sequence is (2048, 1408).</p>

          <p><strong>EchoJEPA inherits this tubelet embedding unchanged from V-JEPA 2.</strong> Echocardiogram clips are tokenized with the exact same 3D convolution, just at echo's own resolution and frame rate.</p>

      <h3>3D RoPE</h3>
          <p>I-JEPA uses a fixed 2D sin-cos positional encoding, added once at the input and never touched by gradients. V-JEPA 2 replaces this with <strong>3D Rotary Position Embeddings (RoPE)</strong>, applied inside every attention layer rather than added once upfront. The extra axis encodes position along time (T), in addition to height (H) and width (W), so the model can tell "the same patch, a different frame" apart from "a different patch, the same frame".</p>
          <p><strong>EchoJEPA inherits 3D RoPE unchanged from V-JEPA 2.</strong> The same T/H/W structure applies directly to echo video clips, so no changes are needed here.</p>

      <h3>Masking and scaling in EchoJEPA</h3>
          <p>The masking mechanism itself, multiblock tube masking, holding the same spatial rectangle constant across every frame so the model must infer what happens inside it <em>over time</em>, is inherited unchanged from V-JEPA 2. What EchoJEPA does re-tune are the scale parameters, adapted to the physical constraints of an ultrasound fan:</p>
          <ul>
            <li><strong>Context mask scale: 0.5&ndash;1.0</strong> of the frame, wider than the default, to preserve enough visible anatomy inside a fan-shaped echo frame where much of the rectangular image is black background outside the sector</li>
            <li><strong>Aspect ratio augmentation: 0.9&ndash;1.1</strong>, far narrower than I-JEPA's 0.75&ndash;1.5, respecting the fan's fixed geometry rather than sampling arbitrarily elongated crops</li>
            <li><strong>Input resolution: 112&times;112 to 224&times;224</strong>, lower than V-JEPA 2's 256/384, since echo images are inherently lower-resolution than natural video</li>
            <li><strong>Temporal resolution: 4&ndash;24 fps</strong>, variable per clip, since heart rate varies across patients, unlike V-JEPA 2's fixed fps</li>
          </ul>

      <h3>I-JEPA vs. V-JEPA 2 vs. EchoJEPA, axis by axis</h3>
          <p>The core algorithm doesn't change across these three. Every difference below is either a domain upgrade (image &rarr; video &rarr; cardiac video) or a scaling decision.</p>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Axis</th><th>I-JEPA</th><th>V-JEPA 2</th><th>EchoJEPA</th></tr></thead>
              <tbody>
                <tr><td>Modality</td><td>Static images</td><td>Natural videos</td><td>Echocardiogram videos</td></tr>
                <tr><td>Patch unit</td><td>2D patch, 16&times;16</td><td>3D tubelet, 2&times;16&times;16</td><td>3D tubelet, 2&times;16&times;16</td></tr>
                <tr><td>Token count (typical)</td><td>256 (14&times;14 grid, 224px)</td><td>2048 (8&times;16&times;16, 16-frame 256px)</td><td>Varies by fps / crop</td></tr>
                <tr><td>Positional encoding</td><td>Fixed 2D sincos (no grad)</td><td>3D RoPE per attention layer</td><td>3D RoPE (inherited)</td></tr>
                <tr><td>Encoder backbone</td><td>ViT-H/14, ~630M params</td><td>ViT-g/16, ~1B params</td><td>ViT-G 1.1B (EchoJEPA-G); ViT-L 300M (EchoJEPA-L)</td></tr>
                <tr><td>Predictor</td><td>12-layer ViT, 384-wide</td><td>12-layer ViT, 384-wide (22M)</td><td>12-layer ViT, 384-wide (inherited)</td></tr>
                <tr><td>Loss</td><td>Smooth L1</td><td>L1</td><td>L1</td></tr>
                <tr><td>EMA momentum</td><td>Ramp 0.996 &rarr; 1.0</td><td>Fixed (no ramp)</td><td>Fixed (inherited)</td></tr>
                <tr><td>Masking</td><td>Multiblock 2D (spatial blocks)</td><td>Multiblock 3D (spatio-temporal tubes)</td><td>Multiblock 3D (inherited)</td></tr>
                <tr><td>Context mask scale</td><td>0.85&ndash;1.0</td><td>Multiblock tubes</td><td>0.5&ndash;1.0 (wider; preserves anatomy in a fan-shaped echo frame)</td></tr>
                <tr><td>Aspect ratio aug</td><td>0.75&ndash;1.5</td><td>Standard</td><td>0.9&ndash;1.1 (narrow; respects fan geometry)</td></tr>
                <tr><td>Input resolution</td><td>224&times;224</td><td>256&times;256 pretrain, 384&times;384 cooldown</td><td>112&times;112&ndash;224&times;224 (echo is inherently low-res)</td></tr>
                <tr><td>Temporal resolution</td><td>N/A</td><td>Fixed fps</td><td>4&ndash;24 fps (heart rate varies across patients)</td></tr>
                <tr><td>Training data</td><td>ImageNet, 1.28M images</td><td>VideoMix22M, ~22M videos</td><td>18.1M echo clips (G) / 525K MIMIC-IV (L)</td></tr>
                <tr><td>Downstream head</td><td>Linear / attentive probe</td><td>Probe-based eval</td><td>Multi-view attentive probe: 4 self-attention blocks, learnable view + clip embeddings, view dropout p=0.1</td></tr>
                <tr><td>Domain adaptations</td><td>None</td><td>None</td><td>Physics-informed perturbations: speckle, depth attenuation, fan geometry</td></tr>
              </tbody>
            </table>
          </div>
          <p class="table-caption"><strong>Table 6.</strong> The one conceptual addition V-JEPA 2 makes over I-JEPA: its tube masks hold the same spatial rectangle constant across every time step, forcing the model to infer what happens inside a region <em>over time</em> from the surrounding context, learning motion and dynamics, not just static appearance.</p>

    </section>

    <section>
      <h2 id="why-echocardiography-breaks-models">Why echocardiography breaks every existing foundation model</h2>
      <p><strong>Ultrasound speckle is structured noise, not signal.</strong> It shows up as a grainy, seemingly random texture caused by constructive and destructive interference between the acoustic wavefront and tissue scatterers too small to resolve individually. <strong>Two frames of the exact same heart, captured a millisecond apart, show identical anatomy and completely different speckle.</strong> It's noise that regenerates itself every frame.</p>

      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/echojepa/echocardiogram-speckle.gif" alt="A looping echocardiogram clip showing the characteristic grainy speckle texture flickering across the entire ultrasound sector frame by frame.">
        </div>
        <figcaption class="figure-caption"><strong>Figure 8.</strong> Notice how the grain keeps shifting every frame, even though the heart barely moves in that time. That's speckle, and it sits right on top of the valve leaflets and chamber walls, exactly where you need a clean edge to tell real motion from noise.</figcaption>
      </figure>

      <p>That single fact is enough to break most of the standard foundation-model recipes when they're pointed at echo:</p>
      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Problem</th><th>How it manifests</th></tr></thead>
          <tbody>
            <tr><td>Speckle sensitivity</td><td>Pixel-reconstruction models (<a href="https://arxiv.org/abs/2203.12602" target="_blank" rel="noopener">VideoMAE</a>/<a href="https://arxiv.org/abs/2111.06377" target="_blank" rel="noopener">MAE</a>) must reproduce speckle faithfully; their representations encode acquisition texture, not anatomy.</td></tr>
            <tr><td>Contrastive collapse</td><td>Text-supervised models (<a href="https://www.nature.com/articles/s41586-025-09850-x" target="_blank" rel="noopener">EchoPrime</a>, <a href="https://www.medrxiv.org/content/10.1101/2024.11.16.24317431v1" target="_blank" rel="noopener">PanEcho</a>) rely on echo reports, which describe findings, not geometry; they learn semantic labels rather than structural representations.</td></tr>
            <tr><td>Single-view bottleneck</td><td>Most models process one clip at a time: tasks like RVSP that require integrating measurements across views (Apical TR velocity + Subcostal IVC) cannot be computed from any single embedding.</td></tr>
            <tr><td>Distribution shift</td><td>Models trained on adult anatomy fail on pediatric hearts (different size, heart rate, geometry) unless the representations encode transferable structure rather than population-specific statistics.</td></tr>
          </tbody>
        </table>
        <p class="table-caption"><strong>Table 7.</strong> Why standard foundation-model recipes break when pointed at echocardiography.</p>
      </div>
    </section>

    <section>
      <h2 id="echojepas-answer">EchoJEPA's answer</h2>
      <p>EchoJEPA applies the Joint-Embedding Predictive Architecture to echocardiography video. Instead of reconstructing pixels, it <strong>predicts the representation of masked spatiotemporal regions from visible context, entirely in latent space</strong>.</p>
      <p><strong>Why this solves the speckle problem:</strong> the EMA target encoder is updated slowly (an exponential moving average of the context encoder). Its representations are stable averages over many gradient steps; <strong>speckle, which is i.i.d. noise per frame, averages out</strong>. Anatomically stable structures (chamber walls, valve motion, geometry) are reinforced because they're consistent across time and views.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/echojepa/echojepa-arch.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/echojepa-arch.png" alt="EchoJEPA architecture diagram: multiple echocardiographic views are partitioned into spatio-temporal tubelets and split into masked and unmasked sets. The encoder processes visible (unmasked) video frames, the predictor infers embeddings for masked regions conditioned on learnable mask tokens, and the EMA encoder processes unmasked frames to provide prediction targets. The L1 loss is computed between predicted and target embeddings, with no gradients flowing into the EMA encoder."></a>
        </div>
        <figcaption class="figure-caption"><strong>Figure 9.</strong> EchoJEPA architecture. Echocardiograms from multiple views are partitioned into spatio-temporal tubelets and split into masked and unmasked sets. The encoder E<sub>&theta;</sub> processes visible (unmasked) video frames, and the predictor P<sub>&phi;</sub> infers embeddings for masked regions conditioned on learnable mask tokens. The EMA encoder E<sub>&theta;&#772;</sub> processes unmasked frames to provide prediction targets. The L1 loss is computed between predicted and target embeddings, with no gradients flowing into the EMA encoder.<br><br><b>Source:</b> <a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a> (2026), Fig. 1.</figcaption>
      </figure>

      <h3>Contributions of the paper</h3>
          <ul>
            <li><strong class="lead-term">EchoJEPA.</strong> A foundation model using latent prediction pretrained on <strong>18 million videos across 300K patients</strong>, the largest echocardiography corpus to date, achieving <strong>state-of-the-art performance</strong> on LVEF estimation and right ventricular systolic pressure (RVSP) prediction, demonstrating that latent prediction outperforms pixel reconstruction for ultrasound.</li>
            <li><strong class="lead-term">Unified evaluation protocol.</strong> A standardized benchmark with frozen backbones, identical probes, and consistent hyperparameter search across all baseline models, <strong>enabling fair comparison of representation quality</strong>.</li>
            <li><strong class="lead-term">Robustness benchmarks.</strong> Physics-informed perturbations using depth attenuation and acoustic shadow, revealing that <strong>EchoJEPA degrades 86% less than EchoPrime</strong> under acoustic perturbations.</li>
            <li><strong class="lead-term">Public release.</strong> EchoJEPA-L, the first open-source JEPA-based echocardiography foundation model, trained on MIMIC-IV-Echo, is <strong>open-sourced</strong> alongside the evaluation framework at <a href="https://github.com/bowang-lab/EchoJEPA" target="_blank" rel="noopener">github.com/bowang-lab/EchoJEPA</a>.</li>
            <li><strong class="lead-term">Scale.</strong> EchoJEPA-G is pretrained on <strong>18.1 million echocardiogram videos across 300,000 patients</strong> (the largest echo pretraining corpus assembled to date) behind a ViT-G encoder at 1.1B parameters. A smaller, publicly released variant, EchoJEPA-L, is pretrained on the 525K videos in MIMIC-IV-Echo.</li>
            <li><strong class="lead-term">Multi-view probing framework.</strong> A method using factorized video stream embeddings and attention masking to integrate information across echocardiographic views <strong>without view-specific components</strong>. A single echocardiography study isn't one video; it's a collection of clips acquired from different transducer positions (Apical 4-chamber, Parasternal long/short axis, Subcostal, and more). <strong>The encoder processes each clip on its own, with no awareness that the others exist.</strong> A separate <strong>study-level attentive probe</strong> is what fuses them: it takes the per-clip embeddings from every acquired view and combines them with cross-attention into one study embedding.
              <p>Right ventricular systolic pressure is the clean test case for whether that fusion is doing real work, because it is <strong>structurally a two-view measurement</strong>:</p>
              <div class="formula">RVSP = 4 &times; (TR jet velocity)&sup2; + RA pressure<br><span style="opacity:.6">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ Apical view ──┘&nbsp;&nbsp;&nbsp;└── Subcostal IVC ──┘</span></div>
            </li>
          </ul>

      <h3>Why a standardized probe is required</h3>
          <div class="pull-quote">We introduce a standardized probing framework that fixes the probe architecture, hyperparameter search, and multi-view fusion strategy across all models, isolating representation quality as the sole variable.<cite><a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a></cite></div>
          <p>This is the design choice that makes the benchmark fair: every model being compared (EchoJEPA, EchoPrime, PanEcho, VideoMAE) uses the same probe architecture, the same LR/weight-decay sweep grid, and the same multi-view fusion strategy. The only thing that differs is the frozen encoder producing the tokens; <strong>any difference in downstream performance is therefore a difference in what the encoder learned, not in how the probe was tuned</strong>.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/multi-view-probing-img.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/multi-view-probing-img.png" alt="Multi-view probing framework diagram: the frozen EchoJEPA encoder extracts video embeddings from multiple echocardiographic views (A4C, PSAX, PLAX), each augmented with learnable view and clip stream embeddings. View dropout is applied during training, and the concatenated tokens are passed to a lightweight attentive probe that outputs study-level predictions, reaching 65% LVEF accuracy."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 10.</strong> Multi-view probing framework. The frozen EchoJEPA encoder extracts video embeddings from multiple echocardiographic views. Each embedding is augmented with learnable view and clip stream embeddings encoding position in the study. During training, view dropout randomly masks views to improve robustness to variable study composition. The concatenated tokens are passed to a lightweight attentive probe that outputs study-level predictions.<br><br><b>Source:</b> <a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a> (2026), Fig. 2.</figcaption>
          </figure>
          <p><strong>Any model that only ever probes one clip at a time is structurally incapable of getting this right</strong>, no matter how good its encoder is, which makes RVSP a useful way to tell "the encoder is strong" apart from "the whole system reasons correctly."</p>

      <h3>Architecture 3: Inside the multi-view attentive probe</h3>

          <div class="diagram-wrap">
            <div class="legend">
              <div class="legend-item"><span class="swatch module"></span>module / op</div>
              <div class="legend-item"><span class="swatch repeat"></span>repeated block (transformer layers)</div>
              <div class="legend-item"><span class="swatch flow"></span>tensor flow, labeled with shape</div>
              <div class="legend-item"><span class="swatch add"></span>&oplus; elementwise add</div>
            </div>
            <figure>
<svg viewBox="0 0 1000 1191" role="img" aria-label="Multi-view attentive probe pipeline: N views x M clips per view are each embedded independently by the frozen EchoJEPA encoder, concatenated into one token sequence, tagged with factorized view and clip slot embeddings (with view dropout during training), mixed by three self-attention blocks, pooled by a single learned query token via cross-attention into one study embedding, and read out by a task-specific linear head into the final prediction.">
<defs>
  <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<a href="#mv-comp-1" id="diagram-mv-comp-1">
<rect class="proc" x="230.0" y="20" width="460" height="82" rx="10" filter="url(#rough)"/>
<text x="460" y="57.0" class="lbl" text-anchor="middle">N Views x M Clips per View</text>
<text x="460" y="75.0" class="sub" text-anchor="middle">Apical 4C, Parasternal, Subcostal, ...</text>
<text x="460" y="91.0" class="sub" text-anchor="middle">each clip: 16 frames, 224x224</text>
</a>
<line x1="460" y1="102" x2="460" y2="136" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="346.4" y="108" width="227.2" height="22" rx="6" class="shapepill"/>
<text x="460" y="123" class="shapetxt" text-anchor="middle">9 views x 2 clips = 18 clips</text>
<a href="#mv-comp-2" id="diagram-mv-comp-2">
<rect class="ghost" x="251.0" y="136.0" width="460" height="110" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="244.0" y="143.0" width="460" height="110" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="237.0" y="150.0" width="460" height="110" rx="18" filter="url(#rough)"/>
<rect class="containerOuter" x="230.0" y="157" width="460" height="110" rx="18" filter="url(#rough)"/>
<text x="250.0" y="185" class="clbl">Frozen Encoder (f)</text>
<text x="460" y="214.0" class="lbl" text-anchor="middle">ViT-G 1.1B / ViT-L 300M</text>
<text x="460" y="234.0" class="sub" text-anchor="middle">no gradients; each clip embedded independently</text>
</a>
<line x1="460" y1="267" x2="460" y2="301" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="372.3" y="273" width="175.4" height="22" rx="6" class="shapepill"/>
<text x="460" y="288" class="shapetxt" text-anchor="middle">per clip: 1568 x 1408</text>
<a href="#mv-comp-3" id="diagram-mv-comp-3">
<rect class="proc" x="260.0" y="301" width="400" height="54" rx="10" filter="url(#rough)"/>
<text x="460" y="330.0" class="lbl" text-anchor="middle">Concatenate</text>
<text x="460" y="342.0" class="sub" text-anchor="middle">cat all 18 clip-token sequences, sequence dim</text>
</a>
<line x1="460" y1="355" x2="460" y2="389" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="401.9" y="361" width="116.2" height="22" rx="6" class="shapepill"/>
<text x="460" y="376" class="shapetxt" text-anchor="middle">28,224 x 1408</text>
<a href="#mv-comp-4">
<rect class="proc" x="70.0" y="415" width="300" height="74" rx="10" filter="url(#rough)"/>
<text x="220" y="448.0" class="lbl" text-anchor="middle">view_embed</text>
<text x="220" y="466.0" class="sub" text-anchor="middle">Embedding(num_views=9, D)</text>
<text x="220" y="482.0" class="sub" text-anchor="middle">view_id = slot_id // clips_per_view</text>
</a>
<a href="#mv-comp-4">
<rect class="proc" x="550.0" y="415" width="300" height="74" rx="10" filter="url(#rough)"/>
<text x="700" y="448.0" class="lbl" text-anchor="middle">clip_embed</text>
<text x="700" y="466.0" class="sub" text-anchor="middle">Embedding(clips_per_view=2, D)</text>
<text x="700" y="482.0" class="sub" text-anchor="middle">clip_id = slot_id % clips_per_view</text>
</a>
<line x1="460" y1="389" x2="460" y2="515" class="arrow" marker-end="url(#arrowhead)"/>
<path d="M 220 489 C 220 511, 390 504, 444 520" class="arrow" marker-end="url(#arrowhead)"/>
<path d="M 700 489 C 700 511, 530 504, 476 520" class="arrow" marker-end="url(#arrowhead)"/>
<a href="#mv-comp-4" id="diagram-mv-comp-4">
<circle cx="460" cy="534" r="19" class="addnode" filter="url(#rough)"/>
<text x="460" y="541" class="addsym" text-anchor="middle">&#8853;</text>
<text x="490" y="539" class="skiplbl" text-anchor="start">x = x + view_embed + clip_embed</text>
</a>
<line x1="460" y1="553" x2="460" y2="598" class="arrow" marker-end="url(#arrowhead)"/>
<a href="#mv-comp-5" id="diagram-mv-comp-5">
<rect class="ghost" x="251.0" y="577.0" width="460" height="120" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="244.0" y="584.0" width="460" height="120" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="237.0" y="591.0" width="460" height="120" rx="18" filter="url(#rough)"/>
<rect class="containerOuter" x="230.0" y="598" width="460" height="120" rx="18" filter="url(#rough)"/>
<text x="250.0" y="626" class="clbl">Self-Attention x 3</text>
<text x="460" y="660.0" class="lbl" text-anchor="middle">LayerNorm -&gt; MHSA -&gt; LayerNorm -&gt; MLP</text>
<text x="460" y="680.0" class="sub" text-anchor="middle">16 heads * dim 1408, MLP hidden = 4D</text>
<text x="460" y="697.0" class="sub" text-anchor="middle">residual connections inside each block</text>
</a>
<line x1="460" y1="718" x2="460" y2="752" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="401.9" y="724" width="116.2" height="22" rx="6" class="shapepill"/>
<text x="460" y="739" class="shapetxt" text-anchor="middle">28,224 x 1408</text>
<polygon class="term" points="739.8,688 920.2,688 930.1,734 729.9,734" filter="url(#rough)"/>
<text x="830" y="716.0" class="lbl" text-anchor="middle">Learned Query</text>
<text x="830" y="752" class="skiplbl" text-anchor="middle">Q: [1, 1408], trunc_normal</text>
<path d="M 830 756 C 830 796, 680 743, 610 783" class="arrow" marker-end="url(#arrowhead)"/>
<a href="#mv-comp-6" id="diagram-mv-comp-6">
<rect class="ghost" x="251.0" y="752.0" width="460" height="120" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="244.0" y="759.0" width="460" height="120" rx="18" filter="url(#rough)"/>
<rect class="ghost" x="237.0" y="766.0" width="460" height="120" rx="18" filter="url(#rough)"/>
<rect class="containerOuter" x="230.0" y="773" width="460" height="120" rx="18" filter="url(#rough)"/>
<text x="250.0" y="801" class="clbl">Cross-Attention (Pool)</text>
<text x="460" y="835.0" class="lbl" text-anchor="middle">LayerNorm -&gt; CrossAttention -&gt; MLP</text>
<text x="460" y="855.0" class="sub" text-anchor="middle">Q: learned query, 1 token</text>
<text x="460" y="872.0" class="sub" text-anchor="middle">K/V: all 28,224 tokens (post self-attn)</text>
</a>
<line x1="460" y1="893" x2="460" y2="927" class="arrow" marker-end="url(#arrowhead)"/>
<rect x="420.4" y="899" width="79.2" height="22" rx="6" class="shapepill"/>
<text x="460" y="914" class="shapetxt" text-anchor="middle">1 x 1408</text>
<polygon class="term" points="309.1,927 610.9,927 627.4,981 292.6,981" filter="url(#rough)"/>
<text x="460" y="959.0" class="lbl" text-anchor="middle">Study Embedding: 1408-d vector</text>
<line x1="460" y1="981" x2="460" y2="1021" class="arrow" marker-end="url(#arrowhead)"/>
<a href="#mv-comp-7" id="diagram-mv-comp-7">
<rect class="proc" x="250.0" y="1021" width="420" height="60" rx="10" filter="url(#rough)"/>
<text x="460" y="1053.0" class="lbl" text-anchor="middle">Linear Head</text>
<text x="460" y="1065.0" class="sub" text-anchor="middle">task-specific: regressor or classifier</text>
</a>
<line x1="460" y1="1081" x2="460" y2="1121" class="arrow" marker-end="url(#arrowhead)"/>
<polygon class="term" points="328.8,1121 591.2,1121 605.6,1171 314.4,1171" filter="url(#rough)"/>
<text x="460" y="1151.0" class="lbl" text-anchor="middle">Task Prediction</text>
</svg>
              <figcaption>
                <dl>
                  <dt id="mv-comp-1"><a href="#diagram-mv-comp-1">Input: Views &amp; Clips</a></dt>
                  <dd>
                    <ul>
                      <li>A study is N views (Apical 4-chamber, Parasternal long/short axis, Subcostal, and more) &times; M clips per view; the default configuration is N&nbsp;=&nbsp;9 views and M&nbsp;=&nbsp;2 clips, giving 18 clips total</li>
                      <li>Each clip is a 16-frame, 224&times;224 video, matching the tubelet embedder's expected input shape <code>[B, C=3, T=16, H=224, W=224]</code></li>
                    </ul>
                  </dd>

                  <dt id="mv-comp-2"><a href="#diagram-mv-comp-2">Frozen Encoder (f)</a></dt>
                  <dd>
                    <ul>
                      <li>This slot is whichever pretrained video encoder is being evaluated: EchoJEPA (ViT-G, 1.1B params, or the smaller ViT-L, 300M), or a baseline such as EchoPrime, PanEcho, or VideoMAE (EchoMAE) swapped in for comparison. It embeds each clip independently; it never sees the other clips or views at this stage</li>
                      <li>A <code>Conv3d(2&times;16&times;16)</code> tubelet embedder turns each 16-frame clip into a grid of 8&times;14&times;14 = 1568 tokens of width D (1408 for ViT-G)</li>
                      <li>No gradients flow into the encoder anywhere in this pipeline; only the probe sitting on top of it is trained</li>
                    </ul>
                  </dd>

                  <dt id="mv-comp-3"><a href="#diagram-mv-comp-3">Concatenate</a></dt>
                  <dd>
                    <ul>
                      <li>The per-clip token sequences from all 18 clips are concatenated along the sequence dimension into one long sequence: 18 &times; 1568 = 28,224 tokens</li>
                      <li><strong>Why early fusion:</strong> the probe can learn cross-view relationships, for example correlating the Apical view's LV size with the Parasternal view's wall thickness, because all tokens sit in the same attention context; a single-clip encoder never could</li>
                    </ul>
                  </dd>

                  <dt id="mv-comp-4"><a href="#diagram-mv-comp-4">Slot Embeddings</a></dt>
                  <dd>
                    <ul>
                      <li>The encoder gives all 18 slots identical-looking tokens; it has no way to know which view or clip each token came from. Slot embeddings inject that positional information by adding a learned vector of width D (1408 for ViT-G) to every token in a slot</li>
                      <li>Two small learned embedding tables fix that:<br>
                        <code>view_embed</code>: 9 entries, keyed by <code>view_id = slot_id // clips_per_view</code><br>
                        <code>clip_embed</code>: 2 entries, keyed by <code>clip_id = slot_id % clips_per_view</code><br>
                        Both are broadcast to all 1568 tokens in a slot via<br>
                        <code>slot_emb.repeat_interleave(Nslot=1568, dim=1)</code><br>
                        and added elementwise (&oplus;)
                      </li>
                      <li><strong>Why factorized:</strong> decouples the 9-dimensional view axis from the 2-dimensional clip axis. Without factorization you'd need 18 independent embeddings and lose generalization across different orderings</li>
                      <li>During training only, entire views are randomly dropped with probability 0.10, so the probe learns to be robust to whatever subset of views a real study happens to include</li>
                    </ul>
                  </dd>

                  <dt id="mv-comp-5"><a href="#diagram-mv-comp-5">Self-Attention Blocks</a></dt>
                  <dd>
                    <ul>
                      <li>Three standard pre-norm transformer blocks mix information across all 28,224 tokens, regardless of which view or clip they came from, each a residual connection:<br>
                        <code>x = x + MHSA(LayerNorm(x))</code><br>
                        <code>x = x + MLP(LayerNorm(x))</code>
                      </li>
                      <li><strong>MHSA:</strong><br>
                        head dim = D / num_heads = 1408 / 16 = 88<br>
                        Q, K, V each projected:<br>
                        <code>[B, 28224, 1408] &rarr; [B, 16, 28224, 88]</code><br>
                        Attention matrix:<br>
                        <code>[B, 16, 28224, 28224]</code>
                      </li>
                      <li><strong>MLP:</strong><br>
                        hidden_dim = D &times; mlp_ratio = 1408 &times; 4.0 = 5632<br>
                        <code>Linear(1408&rarr;5632) &rarr; GELU &rarr; Linear(5632&rarr;1408)</code>
                      </li>
                      <li>This is where cross-view reasoning actually happens: a token from the Apical view can attend directly to a token from the Subcostal view</li>
                    </ul>
                  </dd>

                  <dt id="mv-comp-6"><a href="#diagram-mv-comp-6">Cross-Attention (Pool)</a></dt>
                  <dd>
                    <ul>
                      <li>A single learned query token:<br>
                        <code>self.query_tokens = nn.Parameter(torch.zeros(B, 1, 1408))</code><br>
                        trunc_normal-initialized, is the only query; the full 28,224-token sequence serves as keys and values
                      </li>
                      <li>The CrossAttentionBlock uses the query token as Q and the full 28,224-token sequence as K/V:<br><code>Q: [B, 1, 1408]</code><br><code>K/V: [B, 28224, 1408]</code></li>
                      <li>Attention: <code>softmax(Q&middot;K&#7488;/&radic;88)&middot;V</code>, i.e.<br><code>[B, 1, 28224] &times; [B, 28224, 1408] &rarr; [B, 1, 1408]</code><br>collapsing the entire study, every view and every clip, into one vector</li>
                      <li>After the MLP, squeezing the singleton dimension gives the final <code>[B, 1408]</code> study embedding: this is the pooling step that turns "many clips" into "one study"</li>
                    </ul>
                  </dd>

                  <dt id="mv-comp-7"><a href="#diagram-mv-comp-7">Linear Head</a></dt>
                  <dd>
                    <ul>
                      <li><strong>Regression</strong> (LVEF, RVSP):<br>
                        <code>self.regressor = nn.Linear(D, num_targets, bias=True)</code><br>
                        mapping <code>[B, 1408] &rarr; [B, 1]</code>, e.g. LVEF in %
                      </li>
                      <li><strong>Classification</strong> (13-class view, per codebase config):<br>
                        <code>self.linear = nn.Linear(D, num_classes, bias=True)</code><br>
                        mapping <code>[B, 1408] &rarr; [B, 13]</code>
                      </li>
                      <li>The head architecture is swapped per task, and each task is trained separately with its own head; the frozen encoder and the rest of the probe (concatenation, slot embeddings, self-attention, cross-attention) share the same design across all three tasks, but are not one shared set of trained weights</li>
                    </ul>
                  </dd>
                </dl>
              </figcaption>
            </figure>
            <footer>
              Source: <a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a>.
            </footer>
          </div>

      <h3>Learning targets for the probe</h3>
          <p>Three tasks, each defined by a separate config. The probe head (a linear layer) is swapped per task; the 4-block transformer body is shared in design but trained separately for each.</p>
          <h4>Target 1: LVEF (Left Ventricular Ejection Fraction)</h4>
          <p>LVEF is a single-view task; the Apical 4-chamber view captures both the LV inflow tract and outflow tract, giving enough geometry. <strong>No cross-view reasoning is needed</strong>; the probe runs single-view, not multi-view.</p>
          <h4>Target 2: RVSP (Right Ventricular Systolic Pressure)</h4>
          <p>RVSP only uses 4 clips from 2 views:</p>
          <div class="formula">RVSP = 4 &times; (TR velocity)&sup2; + RAP<br><span style="opacity:.6">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─ from Apical ─┘&nbsp;└── from Subcostal ──┘</span></div>
          <p>TR velocity is the tricuspid regurgitation jet velocity (m/s), measured in the Apical view via continuous-wave Doppler. RAP is right atrial pressure (mmHg), estimated from IVC diameter and collapsibility measured in the Subcostal view. <strong>RVSP is the litmus test for whether multi-view reasoning actually works; competitors that use single-view probes cannot compute it correctly regardless of encoder quality.</strong></p>
          <h4>Target 3: View Classification (13 classes)</h4>
          <p>Probe output is a [B, 13] softmax over view classes, trained with cross-entropy loss. This is a per-clip task, not a study-level aggregation.</p>
          <p><strong>Note:</strong> each of the three tasks is trained and probed independently.</p>

      <h3>Datasets used</h3>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Dataset</th><th>Type</th><th>Size</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Toronto (internal)</td><td>Proprietary, multi-view</td><td>150,000 studies</td><td>Probe training + internal validation</td></tr>
                <tr><td>Chicago (internal)</td><td>Proprietary, multi-view</td><td>60,000 studies</td><td>External holdout site (out-of-distribution)</td></tr>
                <tr><td><a href="https://www.nature.com/articles/s41586-020-2145-8" target="_blank" rel="noopener">EchoNet-Dynamic</a> (Stanford)</td><td>Public, single-view (A4C)</td><td>10,030 videos</td><td>LVEF cross-site evaluation; adult source for pediatric transfer</td></tr>
                <tr><td><a href="https://www.sciencedirect.com/science/article/abs/pii/S0894731723000688" target="_blank" rel="noopener">EchoNet-Pediatric</a></td><td>Public, single-view</td><td>3,516 videos</td><td>Zero-shot pediatric generalization target</td></tr>
                <tr><td><a href="https://physionet.org/content/mimic-iv-echo/1.0/" target="_blank" rel="noopener">MIMIC-IV-Echo</a></td><td>Public, multi-view</td><td>525,000 videos</td><td>EchoJEPA-L pretraining</td></tr>
                <tr><td>Proprietary (UHN)</td><td>Proprietary, multi-view</td><td>18.1M videos, 300K patients</td><td>EchoJEPA-G pretraining</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 8.</strong> Datasets used across EchoJEPA pretraining and evaluation.</p>
          </div>

      <h3>Architectures</h3>
          <p>EchoJEPA trains two variants at different scale, EchoJEPA-G and EchoJEPA-L; the weights for EchoJEPA-L are open-sourced.</p>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Component</th><th>EchoJEPA-G</th><th>EchoJEPA-L</th></tr></thead>
              <tbody>
                <tr><td>Encoder backbone</td><td>ViT-G/16, 1.1B params, 40 layers, width 1408, 16 heads</td><td>ViT-L/16, 300M params, 24 layers, width 1024, 16 heads</td></tr>
                <tr><td>Tubelet embedder</td><td>Conv3d(3, 1408, kernel=2&times;16&times;16, stride=2&times;16&times;16)</td><td>Conv3d(3, 1024, kernel=2&times;16&times;16, stride=2&times;16&times;16)</td></tr>
                <tr><td>Positional encoding</td><td>3D RoPE (T/H/W axes, applied per attention layer)</td><td>3D RoPE</td></tr>
                <tr><td>Predictor</td><td>22M, 12 layers, width 384</td><td>22M, 12 layers, width 384</td></tr>
                <tr><td>Pretraining loss</td><td>L1 in latent space (masked target regions only)</td><td>L1 in latent space</td></tr>
                <tr><td>Target encoder</td><td>EMA of context encoder, fixed momentum</td><td>EMA of context encoder</td></tr>
                <tr><td>Pretraining data</td><td>18.1M proprietary echo videos</td><td>525K MIMIC-IV-Echo</td></tr>
                <tr><td>Attentive probe</td><td>depth=4, 16 heads, D=1408</td><td>depth=4, 16 heads, D=1024</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 9.</strong> EchoJEPA-G and EchoJEPA-L component specifications.</p>
          </div>

    </section>

    <section>
      <h2 id="results">Results: EchoJEPA vs. Competing Methods</h2>
      <p>All models are evaluated with identical probes: same architecture (depth=4, 16 heads), same LR/weight-decay sweep, same multi-view fusion. The only variable is the frozen encoder.</p>
      <ul>
        <li><strong class="lead-term"><a href="https://www.nature.com/articles/s41586-025-09850-x" target="_blank" rel="noopener">EchoPrime.</a></strong> Contrastive VLM, trained on 1M+ echo videos with report supervision.</li>
        <li><strong class="lead-term"><a href="https://www.medrxiv.org/content/10.1101/2024.11.16.24317431v1" target="_blank" rel="noopener">PanEcho.</a></strong> Contrastive model trained on 1M+ echo-report pairs.</li>
        <li><strong class="lead-term">EchoMAE-L.</strong> Pixel reconstruction (<a href="https://arxiv.org/abs/2203.12602" target="_blank" rel="noopener">VideoMAE</a> objective), same ViT-L backbone as EchoJEPA-L; the direct apples-to-apples ablation of latent vs. pixel prediction.</li>
        <li><strong class="lead-term">EchoJEPA-L.</strong> V-JEPA 2 latent prediction, ViT-L, trained on 525K public MIMIC-IV-Echo videos.</li>
        <li><strong class="lead-term">EchoJEPA-G.</strong> V-JEPA 2 latent prediction, ViT-G (1.1B), trained on 18.1M proprietary echo videos.</li>
      </ul>

      <h3>Summary</h3>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Task</th><th>Metric</th><th>EchoMAE-L</th><th>EchoPrime</th><th>EchoJEPA-G</th><th>vs. EchoMAE-L</th><th>vs. EchoPrime</th></tr></thead>
              <tbody>
                <tr><td>LVEF (Stanford)</td><td>MAE &darr;</td><td>8.52</td><td>4.87</td><td class="hl">3.97</td><td>&minus;53%</td><td>&minus;19%</td></tr>
                <tr><td>View ID (1% labels)</td><td>Acc % &uarr;</td><td>21.8</td><td>21.6</td><td class="hl">78.6</td><td>+260%</td><td>+264%</td></tr>
                <tr><td>RVSP (Toronto)</td><td>MAE &darr;</td><td>5.36</td><td>5.65</td><td class="hl">4.54</td><td>&minus;15%</td><td>&minus;20%</td></tr>
                <tr><td>Robustness</td><td>Avg. degradation</td><td>+0.5%&dagger;</td><td>+16.8%</td><td class="hl">+2.3%</td><td>n/a</td><td>&minus;86%</td></tr>
                <tr><td>Pediatric zero-shot</td><td>MAE &darr;</td><td>6.79</td><td>5.10</td><td class="hl">4.32</td><td>&minus;36%</td><td>&minus;15%</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 10.</strong> The headline numbers across every task: latent prediction (EchoJEPA-G) beats both the pixel-reconstruction baseline (EchoMAE-L) and the strongest contrastive/text-supervised baseline (EchoPrime) on accuracy, label efficiency, robustness, and cross-population generalization at once.</p>
          </div>

      <h3>Attention visualization</h3>
          <p>Decoding what each model's encoder actually attends to, before and after finetuning on echocardiograms, shows why latent prediction produces more anatomically grounded representations.</p>
          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/attn-viz.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/attn-viz.png" alt="Attention visualization comparing VideoMAE and V-JEPA across three frames of an apical four-chamber echocardiogram, pretrained and finetuned. VideoMAE's attention is scattered and diffuse; finetuned V-JEPA shows precise, tight localization on valve leaflets and ventricular walls that tracks cardiac motion across frames."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 11.</strong> Attention visualization comparing VideoMAE and V-JEPA. Columns show three frames from an apical four-chamber echocardiogram under pretrained and finetuned conditions. Rows display received attention and given attention for each model. Finetuned V-JEPA in the bottom right demonstrates precise localization on valve leaflets and ventricular walls synchronized to cardiac motion.<br><br><b>Source:</b> <a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a> (2026), Fig. 4.</figcaption>
          </figure>

      <h3>Latent space analysis</h3>
          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/umap-viz.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/umap-viz.png" alt="UMAP visualization of frozen video representations colored by echocardiographic view, comparing PanEcho, EchoPrime, EchoMAE-L, EchoJEPA-L, and EchoJEPA-G. Baseline embeddings are diffuse with heavy class overlap. EchoJEPA models form distinct, well-separated anatomical clusters, including a clear separation of transesophageal (TEE) views."></a>
            </div>
            <figcaption class="figure-caption"><strong>Figure 12.</strong> UMAP visualization of frozen video representations colored by echocardiographic view. Baselines (left) exhibit diffuse distributions with significant class overlap, correlating with lower probe accuracy. EchoJEPA models (right) form distinct anatomical clusters, including a clear separation of Transesophageal (TEE) views.<br><br><b>Source:</b> <a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a> (2026), Fig. 5.</figcaption>
          </figure>

    </section>

    <section>
      <h2 id="what-this-means-going-forward">What this means going forward</h2>
      <p>In November 2025, LeCun announced his departure from Meta after twelve years (five as FAIR's founding director, seven as Chief AI Scientist) to co-found Advanced Machine Intelligence Labs (AMI Labs) in Paris. AMI Labs targets industrial, robotic, and healthcare applications using JEPA-based learning from video and sensor data; the fundraise signals investor confidence that world models (not LLM-style next-token prediction) are the path forward.</p>
      <p>The JEPA family has fanned out quickly since. LLM-JEPA applies the objective to language, predicting latent token-sequence representations instead of the next token, and outperforms standard LLM training objectives. LeJEPA is a leaner, theoretically grounded reformulation of the whole framework that removes ad-hoc heuristics. ACT-JEPA conditions on actions for efficient policy representation learning in robotics. LeWorldModel adds value shaping to the JEPA world model's representation space to enable planning. VL-JEPA predicts continuous text embeddings for vision-language tasks instead of generating tokens autoregressively. US-JEPA generalizes the approach to ultrasound imaging in general, learning anatomical dependencies and tissue-texture relationships across multiple ultrasound modalities. And V-JEPA 2.1 pushes denser spatiotemporal features out of the original video model, setting new marks on Ego4D and EPIC-KITCHENS.</p>

      <h3>The JEPA family, as of this writing</h3>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Paper</th><th>arXiv</th><th>Date</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td>LLM-JEPA</td><td><a href="https://arxiv.org/abs/2509.14252" target="_blank" rel="noopener">2509.14252</a></td><td>Oct 2025</td><td>JEPA objective for LLMs: predicts latent representations of token sequences rather than tokens themselves; outperforms standard LLM training objectives</td></tr>
                <tr><td>LeJEPA</td><td><a href="https://arxiv.org/abs/2511.08544" target="_blank" rel="noopener">2511.08544</a></td><td>Nov 2025</td><td>"Lean JEPA", a theoretically grounded reformulation removing ad-hoc heuristics; scalable and clean</td></tr>
                <tr><td>ACT-JEPA</td><td><a href="https://arxiv.org/abs/2501.14622" target="_blank" rel="noopener">2501.14622</a></td><td>Jan 2026</td><td>Action-conditioned JEPA for efficient policy representation learning in robotics</td></tr>
                <tr><td>LeWorldModel</td><td><a href="https://arxiv.org/abs/2601.00844" target="_blank" rel="noopener">2601.00844</a></td><td>Dec 2025</td><td>Adds value shaping to the JEPA world model's representation space to enable planning</td></tr>
                <tr><td>VL-JEPA</td><td><a href="https://arxiv.org/abs/2512.10942" target="_blank" rel="noopener">2512.10942</a></td><td>Feb 2026</td><td>Vision-language model predicting continuous text embeddings instead of autoregressive token generation: 50% fewer trainable parameters, 2.85&times; fewer operations at inference via selective decoding</td></tr>
                <tr><td>US-JEPA</td><td><a href="https://arxiv.org/abs/2602.19322" target="_blank" rel="noopener">2602.19322</a></td><td>Feb 2026</td><td>JEPA applied to general ultrasound imaging: learns anatomical dependencies and tissue-texture relationships across multiple ultrasound modalities</td></tr>
                <tr><td>V-JEPA 2.1</td><td><a href="https://arxiv.org/abs/2603.14482" target="_blank" rel="noopener">2603.14482</a></td><td>Mar 2026</td><td>Unlocks denser spatiotemporal features from V-JEPA 2: state of the art on Ego4D (7.71 mAP) and EPIC-KITCHENS (40.8 Recall@5)</td></tr>
              </tbody>
            </table>
            <p class="table-caption"><strong>Table 11.</strong> The JEPA family tree, as of this writing.</p>
          </div>

    </section>

    <section class="sources" id="sources">
      <h2>Sources</h2>
      <ol>
        <li><a href="https://www.thesingularityproject.ai/p/yann-lecuns-joint-embedding-predictive" target="_blank" rel="noopener">Yann LeCun's Joint Embedding Predictive Architecture (JEPA) and the General Theory of Intelligence</a></li>
        <li>LeCun, <em>A Path Towards Autonomous Machine Intelligence</em> (2022), <a href="https://openreview.net/pdf?id=BZ5a1r-kVsf" target="_blank" rel="noopener">openreview.net/pdf?id=BZ5a1r-kVsf</a></li>
        <li><a href="https://ai.meta.com/blog/yann-lecun-ai-model-i-jepa/" target="_blank" rel="noopener">I-JEPA: The first AI model based on Yann LeCun's vision for more human-like AI</a></li>
        <li>Assran et al., <em>I-JEPA: Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture</em> (2023), <a href="https://arxiv.org/abs/2301.08243" target="_blank" rel="noopener">arxiv.org/abs/2301.08243</a></li>
        <li><em>MC-JEPA: A Joint-Embedding Predictive Architecture for Self-Supervised Learning of Motion and Content Features</em> (2023), <a href="https://arxiv.org/abs/2307.12698" target="_blank" rel="noopener">arxiv.org/abs/2307.12698</a></li>
        <li>Bardes et al., <em>V-JEPA: Revisiting Feature Prediction for Learning Visual Representations from Video</em> (2024), <a href="https://arxiv.org/abs/2404.08471" target="_blank" rel="noopener">arxiv.org/abs/2404.08471</a></li>
        <li>Garrido, Ballas, Assran et al., <em>Intuitive physics understanding emerges from self-supervised pretraining on natural videos</em> (2025), <a href="https://arxiv.org/abs/2502.11831" target="_blank" rel="noopener">arxiv.org/abs/2502.11831</a></li>
        <li>Meta AI, <em>V-JEPA 2</em> (2025), <a href="https://arxiv.org/abs/2506.09985" target="_blank" rel="noopener">arxiv.org/abs/2506.09985</a></li>
        <li><a href="https://echojepa.com/" target="_blank" rel="noopener">EchoJEPA</a></li>
        <li><a href="https://github.com/bowang-lab/EchoJEPA" target="_blank" rel="noopener">EchoJEPA codebase</a></li>
        <li><a href="https://arxiv.org/abs/2602.02603" target="_blank" rel="noopener">EchoJEPA paper</a></li>
        <li><a href="https://x.com/aakashgupta/status/2046371351016161745?s=48" target="_blank" rel="noopener">x.com/aakashgupta/status/2046371351016161745</a></li>
      </ol>
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
