---
layout: blog
permalink: /blogs/echojepa-old/
title: 'Echo(JEPA) and Its Origins'
lead: "How Yann LeCun's bet against pixel prediction became the largest latent-predictive foundation model built for the heart."
date: 2026-08-11
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
      <li><a href="#evaluating-ijepa">Evaluating I-JEPA on ImageNet</a></li>
      <li><a href="#the-lineage">The Lineage</a></li>
      <li><a href="#why-echocardiography-breaks-models">Why Echocardiography Breaks Every Existing Foundation Model</a></li>
      <li><a href="#echojepas-answer">EchoJEPA's Answer</a></li>
      <li><a href="#ultrasound-augmentation">Ultrasound-Specific Data Augmentation</a></li>
      <li><a href="#does-it-actually-work">Does It Actually Work?</a></li>
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
      <p>JEPA&mdash;the Joint-Embedding Predictive Architecture&mdash;is the brainchild of Yann LeCun, formerly Meta's Chief AI Scientist. His vision is to create machines that can learn <strong>internal models of how the world works</strong>, so that they can learn much more quickly, plan how to accomplish complex tasks, and readily adapt to unfamiliar situations.</p>
      <p>The idea is grounded in the fact that humans learn an enormous amount of background knowledge about the world just by passively observing it. It has been hypothesized that this common-sense information is key to enabling intelligent behavior such as sample-efficient acquisition of new concepts, grounding, and planning&mdash;capabilities LeCun thinks current LLM paradigms currently lack. His philosophy, in short: generative modeling alone is not enough; we need strong predictive models as foundations.</p>
    </section>

    <section>
      <h2 id="what-jepa-actually-predicts">What JEPA actually predicts</h2>
      <p>In JEPA, a model ingests a pair of related inputs&mdash;e.g. consecutive video frames or adjacent image patches&mdash;and encodes each into an <strong>abstract representation</strong>. A predictor module then tries to predict the representation of the "target" input from the representation of the "context" input.</p>
      <p>Unlike generative models, JEPA does not attempt to reconstruct every detail of the input; it works in an abstract embedding space, which lets it focus on <strong>high-level, essential information</strong> and ignore irrelevant or unpredictable details. The model can be viewed as an <strong>Energy-Based Model (EBM)</strong> operating on representations: it assigns low energy when the predicted representation matches the actual target representation, and high energy when they mismatch. The "joint embedding" part means both inputs are mapped into a common representation space where the prediction is made, rather than directly predicting raw data.</p>
      <p>From an information-theoretic perspective, the goal is to capture as much predictable information as possible in the representations while discarding unpredictable noise. This involves a delicate balance between information preservation and compression: if the representation preserves nearly all information from the input, it may include lots of irrelevant or random detail that makes prediction difficult; if it compresses too aggressively, it may lose the structure needed to predict the target. In other words, JEPA seeks an abstraction level where the representation has high mutual information with both the input and the target, but low entropy in terms of irrelevant bits. LeCun's own example is video prediction: trying to predict every pixel of future frames is nearly impossible due to chaotic details like flickering leaves or textured surfaces.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/echojepa/jepa-architecture-comparison.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/jepa-architecture-comparison.png" alt="Three architecture diagrams: (a) Joint-Embedding architecture with two encoders and a decoder D(x,y), (b) Generative architecture with an encoder, decoder, and latent z, (c) Joint-Embedding Predictive Architecture with a predictor Pred(x,z) between the two encoders."></a>
        </div>
        <figcaption class="figure-caption">Common architectures for self-supervised learning, each assigning low energy to compatible inputs and high energy to incompatible ones. (a) Joint-embedding (invariant) architectures learn to output similar embeddings for compatible inputs x, y. (b) Generative architectures learn to directly reconstruct a signal y from a compatible signal x, via a decoder conditioned on a latent z. (c) Joint-embedding predictive architectures learn to predict the embedding of y from x, via a predictor conditioned on a latent z.</figcaption>
      </figure>

      <h3>I-JEPA: the first concrete implementation</h3>
          <p>I-JEPA (Image Joint Embedding Predictive Architecture) is the first concrete implementation of JEPA, for computer vision. The idea is to predict missing information in an abstract representation that's more akin to the general understanding people have. Compared to generative methods that predict in pixel/token space, I-JEPA uses abstract prediction targets, for which unnecessary pixel-level details are potentially eliminated&mdash;leading the model to learn more semantic features. A second core design choice guiding I-JEPA toward semantic representations is its <strong>multi-block masking strategy</strong>: predicting large blocks containing semantic information (at sufficiently large scale), using an informative, spatially distributed context.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/ijepa-context-target.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/ijepa-context-target.png" alt="I-JEPA diagram: a context block is passed through a context encoder, producing a representation. A target encoder processes several target blocks from the full image, and a predictor conditioned on positional information predicts each target block's representation from the context representation."></a>
            </div>
            <figcaption class="figure-caption">I-JEPA's context/target/predictor setup. The context encoder f<sub>&theta;</sub> and target encoder f<sub>&theta;&#772;</sub> map a context block and several target blocks into representation space; a predictor g<sub>&phi;</sub>, conditioned on positional information, predicts each target block's representation from the context block's representation.</figcaption>
          </figure>

      <h3>The self-supervised learning family tree</h3>
          <p>JEPA didn't invent self-supervised learning&mdash;it's a deliberate third option next to two established families, each with a well-known failure mode.</p>
          <h4>Invariance-based (joint-embedding) methods</h4>
          <p>Train an encoder to output similar embeddings for different views of the same input&mdash;views constructed via hand-crafted data augmentations (random scaling, cropping, color jittering). The energy landscape is flat for compatible inputs (low energy regardless of what the encoder outputs), so these methods need tricks to prevent representation collapse, where the encoder ignores the input entirely.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/invariance-joint-embedding.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/invariance-joint-embedding.png" alt="Invariance-based joint-embedding diagram: augmented views of the same image (e.g. a dog, a chair) are each passed through a CNN and MLP to produce representations. A repel force pushes apart the representations of different images to prevent collapse."></a>
            </div>
            <figcaption class="figure-caption">An invariance-based joint-embedding setup. Augmented views of the same image are pushed toward similar embeddings; a "repel" term keeps embeddings of different images apart to prevent collapse.</figcaption>
          </figure>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Sub-type</th><th>Mechanism</th><th>Examples</th></tr></thead>
              <tbody>
                <tr><td>Contrastive</td><td>Explicitly pushes apart embeddings of negative (incompatible) pairs</td><td>SimCLR, MoCo</td></tr>
                <tr><td>Non-contrastive</td><td>Minimizes informational redundancy across embeddings</td><td>Barlow Twins, VICReg</td></tr>
                <tr><td>Clustering-based</td><td>Maximizes entropy of the average embedding</td><td>SwAV</td></tr>
                <tr><td>Asymmetric architecture</td><td>Asymmetric x-encoder / y-encoder design to avoid collapse</td><td>BYOL, SimSiam</td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>Limitation:</strong> the hard-coded augmentation invariances may not transfer across tasks or modalities&mdash;image classification and segmentation don't need the same invariances.</p>

          <h4>Generative (reconstruction) methods</h4>
          <p>Learn to directly reconstruct signal y from a compatible signal x, using a decoder conditioned on a latent z. Reconstruction collapse isn't a concern here, since the informational capacity of z is kept low.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/generative-reconstruction.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/generative-reconstruction.png" alt="Generative/reconstruction diagram: a masked input image is passed through an encoder to a compact representation, then a decoder reconstructs the full target image directly in pixel space."></a>
            </div>
            <figcaption class="figure-caption">A generative/reconstruction setup. The encoder compresses the (partially masked) input, and a decoder reconstructs the target directly in pixel space.</figcaption>
          </figure>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Method</th><th>What is z</th><th>Notes</th></tr></thead>
              <tbody>
                <tr><td>MAE</td><td>Position tokens for masked patches</td><td>Encoder only sees visible patches</td></tr>
                <tr><td>BEiT</td><td>Tokenized patch targets (dVAE)</td><td>Predicts discrete tokens, not pixels</td></tr>
                <tr><td>SimMIM</td><td>Histogram of Gradients feature space</td><td>Advantage over raw pixels</td></tr>
                <tr><td>CAE</td><td>Encoder + decoder with alignment constraint</td><td>Enforces representation predictability</td></tr>
                <tr><td>data2vec</td><td>Online target encoder representations</td><td>Predicts via masked encoder</td></tr>
              </tbody>
            </table>
          </div>
          <p><strong>Limitation:</strong> because the loss is in pixel/token space, the model is penalized for every low-level mismatch, incentivizing it to model texture and noise rather than semantics.</p>
          <p>Each of these methods is already trying to move the prediction target away from raw pixels&mdash;JEPA is the version of that idea taken all the way, with no decoder and no reconstruction loss at all.</p>

    </section>

    <section>
      <h2 id="evaluating-ijepa">Evaluating I-JEPA on ImageNet</h2>
      <p>Before the recipe was extended to video and then to echocardiography, I-JEPA had to prove itself against the standard self-supervised learning benchmarks on ImageNet.</p>

      <h3>Linear probing</h3>
          <p>Linear probing is a standard evaluation protocol to measure pretrained representation quality without allowing the model to adapt to the new task. Procedure: freeze the pretrained encoder (zero weight updates); pass all training images through the frozen encoder to extract representations (for I-JEPA, average-pooled patch representations from the last layer); train a single linear layer (plus softmax) on top of those frozen representations; evaluate accuracy on the test set. The transfer part means the encoder was pretrained on one dataset (ImageNet) and the linear classifier is evaluated on a different dataset&mdash;CIFAR-100, Places205, and iNat18.</p>
          <p><strong>Why it matters:</strong> a linear classifier can only separate classes if they are already linearly separable in representation space. This directly measures how semantically structured the representations are&mdash;low-level texture features will not be linearly separable by category, but high-level semantic features will be. Fine-tuning would allow the model to compensate for poor representations by updating weights, which masks representation quality.</p>

          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Method</th><th>Arch.</th><th>CIFAR100</th><th>Places205</th><th>iNat18</th></tr></thead>
              <tbody>
                <tr><td colspan="5"><em>Methods without view data augmentations</em></td></tr>
                <tr><td>data2vec</td><td>ViT-L/16</td><td>81.6</td><td>54.6</td><td>28.1</td></tr>
                <tr><td>MAE</td><td>ViT-H/14</td><td>77.3</td><td>55.0</td><td>32.9</td></tr>
                <tr><td>I-JEPA</td><td>ViT-H/14</td><td class="hl">87.5</td><td class="hl">58.4</td><td class="hl">47.6</td></tr>
                <tr><td colspan="5"><em>Methods using extra view data augmentations</em></td></tr>
                <tr><td>DINO</td><td>ViT-B/8</td><td>84.9</td><td>57.9</td><td>55.9</td></tr>
                <tr><td>iBOT</td><td>ViT-L/16</td><td>88.3</td><td>60.4</td><td>57.3</td></tr>
              </tbody>
            </table>
            <p class="table-caption">Linear-probe transfer for image classification. I-JEPA significantly outperforms previous methods that also do not use augmentations (MAE and data2vec), and decreases the gap with the best view-invariance-based methods that leverage hand-crafted data augmentations during pretraining.</p>
          </div>

      <h3>Fine tuning</h3>
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
            <p class="table-caption">ImageNet. Linear-evaluation on ImageNet-1k (the ViT-H/16<sub>448</sub> is pretrained at a resolution of 448&times;448). I-JEPA improves linear probing performance compared to other methods that do not rely on hand-crafted view data-augmentations during pretraining, and demonstrates good scalability&mdash;the larger I-JEPA model matches the performance of view-invariance approaches without requiring view data-augmentations.</p>
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
            <p class="table-caption">ImageNet-1%. Semi-supervised evaluation on ImageNet-1K using only 1% of the available labels; models are adapted via fine-tuning or linear-probing, whichever works best for each method. I-JEPA outperforms MAE, which also does not rely on hand-crafted data-augmentations during pretraining, and benefits from scale&mdash;a ViT-H/16 trained at resolution 448 surpasses previous methods including ones that leverage extra hand-crafted data-augmentations.</p>
          </div>

          <p>A qualitative result from the same evaluation: decoding the I-JEPA predictor's output for masked regions (via a generative model conditioned on the predictor's representations) shows the predictor correctly capturing positional uncertainty and producing high-level object parts with the correct pose&mdash;for example, the back of a bird or the top of a car&mdash;while discarding precise low-level detail and background information.</p>

    </section>

    <section>
      <h2 id="the-lineage">The lineage</h2>
      <p>I-JEPA &rarr; V-JEPA &rarr; EchoJEPA, with V-JEPA 2 the scaling step whose recipe EchoJEPA inherits directly. Every step below keeps the same three pieces&mdash;a context encoder, a slowly-updated target encoder, and a small predictor sitting between them&mdash;and changes only what's being encoded and how much data it's shown.</p>

      <ol class="timeline">
        <li class="timeline-item">
          <div class="timeline-date">2022</div>
          <h3 class="timeline-title">A Path Towards Autonomous Machine Intelligence</h3>
          <p class="timeline-desc">LeCun's vision for next-generation AI, with JEPA as a central component. Proposes a six-module architecture (perception, world model, cost, memory, action, configurator) and argues that a non-generative, joint-embedding world model can learn hierarchical representations of the world.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2023</div>
          <h3 class="timeline-title">I-JEPA &mdash; images</h3>
          <p class="timeline-desc">The first concrete implementation of JEPA for computer vision.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2023</div>
          <h3 class="timeline-title">MC-JEPA &mdash; motion + content</h3>
          <p class="timeline-desc">Extends JEPA to video by jointly learning two kinds of representations: one for static content (objects/appearance) and one for motion (optical flow).</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2023</div>
          <h3 class="timeline-title">Emergent results &mdash; intuitive physics from video prediction</h3>
          <p class="timeline-desc">A V-JEPA model can develop a rudimentary "intuitive physics" understanding&mdash;it emerges from self-supervised pretraining on natural videos.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2024</div>
          <h3 class="timeline-title">V-JEPA &mdash; revisiting feature prediction for video</h3>
          <p class="timeline-desc">The first large-scale video-based JEPA model. Trains on a massive set of 2+ million unlabelled videos, using only the feature prediction objective&mdash;no contrastive pairs, no text or labels, no pretrained image encoder.</p>
        </li>
        <li class="timeline-item">
          <div class="timeline-date">2026</div>
          <h3 class="timeline-title">EchoJEPA &mdash; the heart</h3>
          <p class="timeline-desc">A foundation model trained on 18 million echocardiograms across 300K patients, representing the largest pretraining corpus for this modality to date. By leveraging a latent predictive objective, EchoJEPA learns robust anatomical representations that ignore speckle noise.</p>
        </li>
      </ol>

      <h3>Target encoder EMA and the loss</h3>
          <p>At the start of training, the target encoder is a direct weight copy of the context encoder&mdash;every parameter tensor duplicated. In the original I-JEPA ViT-H, that's the patch projection, positional embeddings, and all 32 transformer layers. From there, each training step has two phases: the context encoder gets a gradient update, then the target encoder gets an EMA update:</p>
          <div class="formula">&theta;<sub>ema</sub> &larr; m &middot; &theta;<sub>ema</sub> + (1 &minus; m) &middot; &theta;<sub>context</sub></div>
          <p>Here &theta;<sub>ema</sub> is the current theta value, m is the momentum, and &theta;<sub>context</sub> is the new context-encoder value. With m&nbsp;=&nbsp;0.996, that's:</p>
          <div class="formula">&theta;<sub>ema</sub> &larr; 0.996 &middot; &theta;<sub>ema</sub> + 0.004 &middot; &theta;<sub>context</sub></div>
          <p>This is a weighted average of all past context-encoder states, with exponentially decaying weights for older states. Momentum doesn't stay fixed at 0.996&mdash;it ramps linearly to 1.0 over the full training run. Early in training, m&nbsp;=&nbsp;0.996 (a window of roughly 250 steps) lets the target encoder move quickly to escape its random initialization, so targets aren't permanently anchored to noise. Late in training, m approaches 1.0 and the averaging window approaches infinity: representations have become semantic and stable, and freezing the targets gives the predictor a clean, consistent signal to converge on. It's the <strong>target</strong> encoder that's used for all downstream tasks&mdash;not the context encoder.</p>
          <p>The loss itself is the average L2 distance between each predicted patch-level representation and the corresponding target patch-level representation:</p>
          <div class="formula">(1/M) &sum;<sub>i=1</sub><sup>M</sup> D(&scaron;<sub>y</sub>(i), s<sub>y</sub>(i)) &nbsp;=&nbsp; (1/M) &sum;<sub>i=1</sub><sup>M</sup> &sum;<sub>j&isin;B<sub>i</sub></sub> &Vert;&scaron;<sub>yj</sub> &minus; s<sub>yj</sub>&Vert;<sup>2</sup><sub>2</sub></div>
          <p>The parameters of the predictor (&phi;) and the context encoder (&theta;) are learned through gradient-based optimization, while the parameters of the target encoder (&theta;&#772;) are updated via the exponential moving average above.</p>

      <h3>From patches to tubelets: how V-JEPA 2 tokenizes video</h3>
          <p>V-JEPA 2 uses <strong>tubelets</strong>: small 3D cuboids that span 2 frames temporally and 16&times;16 pixels spatially. A single <code>Conv3d(3, embed_dim, kernel=(2,16,16), stride=(2,16,16))</code> implements this&mdash;identical idea to I-JEPA's <code>Conv2d</code> patch projection, just with one extra dimension.</p>

          <figure class="figure">
            <div class="figure-frame is-wide">
              <a href="/img/blogs/echojepa/vjepa-initial-block.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/vjepa-initial-block.png" alt="V-JEPA initial block diagram: 16 video frames at 224x224 pass through a 3D convolution producing an 8x14x14xd grid, which is added to 3D sin-cos absolute position embeddings and flattened into a 1568xd token sequence."></a>
            </div>
            <figcaption class="figure-caption">V-JEPA's initial block. 16 video frames at 224&times;224 resolution pass through a 3D convolution that produces an 8&times;14&times;14&times;d grid of tubelet embeddings, which are added to 3D sin-cos absolute position embeddings and flattened into a 1568&times;d token sequence.</figcaption>
          </figure>

          <p>A second, standard-pretraining worked example from the deck, at 256&times;256 resolution:</p>
          <div class="formula">Input video x : (3, 16, 256, 256)&nbsp;&nbsp;&nbsp;# (C, T, H, W)<br>Tubelet size&nbsp; : (2, 16, 16)<br><br>Grid dims:<br>&nbsp;&nbsp;T' = 16 / 2&nbsp; = 8<br>&nbsp;&nbsp;H' = 256/16&nbsp; = 16<br>&nbsp;&nbsp;W' = 256/16&nbsp; = 16<br><br>N_tokens = T' * H' * W' = 8 * 16 * 16 = 2048 tokens</div>
          <p>Each tubelet passes through the <code>Conv3d</code> patch embedder and is projected to the encoder width (e.g., 1408 for ViT-g). The resulting token sequence is (2048, 1408).</p>

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
                <tr><td>Context mask scale</td><td>0.85&ndash;1.0</td><td>Multiblock tubes</td><td>0.5&ndash;1.0 (wider &mdash; preserves anatomy in a fan-shaped echo frame)</td></tr>
                <tr><td>Aspect ratio aug</td><td>0.75&ndash;1.5</td><td>Standard</td><td>0.9&ndash;1.1 (narrow &mdash; respects fan geometry)</td></tr>
                <tr><td>Input resolution</td><td>224&times;224</td><td>256&times;256 pretrain, 384&times;384 cooldown</td><td>112&times;112&ndash;224&times;224 (echo is inherently low-res)</td></tr>
                <tr><td>Temporal resolution</td><td>N/A</td><td>Fixed fps</td><td>4&ndash;24 fps (heart rate varies across patients)</td></tr>
                <tr><td>Training data</td><td>ImageNet, 1.28M images</td><td>VideoMix22M, ~22M videos</td><td>18.1M echo clips (G) / 525K MIMIC-IV (L)</td></tr>
                <tr><td>Downstream head</td><td>Linear / attentive probe</td><td>Probe-based eval</td><td>Multi-view attentive probe: 4 self-attention blocks, learnable view + clip embeddings, view dropout p=0.1</td></tr>
                <tr><td>Domain adaptations</td><td>None</td><td>None</td><td>Physics-informed perturbations: speckle, depth attenuation, fan geometry</td></tr>
              </tbody>
            </table>
          </div>
          <p class="table-caption">The one conceptual addition V-JEPA 2 makes over I-JEPA: its tube masks hold the same spatial rectangle constant across every time step, forcing the model to infer what happens inside a region <em>over time</em> from the surrounding context&mdash;learning motion and dynamics, not just static appearance.</p>

    </section>

    <section>
      <h2 id="why-echocardiography-breaks-models">Why echocardiography breaks every existing foundation model</h2>
      <p>Ultrasound speckle is structured noise, not signal. It shows up as a grainy, seemingly random texture caused by constructive and destructive interference between the acoustic wavefront and tissue scatterers too small to resolve individually. Two frames of the exact same heart, captured a millisecond apart, show identical anatomy&mdash;and completely different speckle. It's noise that regenerates itself every frame.</p>
      <p>That single fact is enough to break most of the standard foundation-model recipes when they're pointed at echo:</p>
      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Problem</th><th>How it manifests</th></tr></thead>
          <tbody>
            <tr><td>Speckle sensitivity</td><td>Pixel-reconstruction models (VideoMAE/MAE) must reproduce speckle faithfully&mdash;their representations encode acquisition texture, not anatomy.</td></tr>
            <tr><td>Contrastive collapse</td><td>Text-supervised models (EchoPrime, PanEcho) rely on echo reports, which describe findings, not geometry&mdash;they learn semantic labels rather than structural representations.</td></tr>
            <tr><td>Single-view bottleneck</td><td>Most models process one clip at a time&mdash;tasks like RVSP that require integrating measurements across views (Apical TR velocity + Subcostal IVC) cannot be computed from any single embedding.</td></tr>
            <tr><td>Distribution shift</td><td>Models trained on adult anatomy fail on pediatric hearts (different size, heart rate, geometry) unless the representations encode transferable structure rather than population-specific statistics.</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section>
      <h2 id="echojepas-answer">EchoJEPA's answer</h2>
      <p>EchoJEPA applies the Joint-Embedding Predictive Architecture to echocardiography video. Instead of reconstructing pixels, it predicts the representation of masked spatiotemporal regions from visible context&mdash;entirely in latent space.</p>
      <p><strong>Why this solves the speckle problem:</strong> the EMA target encoder is updated slowly (an exponential moving average of the context encoder). Its representations are stable averages over many gradient steps&mdash;speckle, which is i.i.d. noise per frame, averages out. Anatomically stable structures (chamber walls, valve motion, geometry) are reinforced because they're consistent across time and views.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/echojepa/echojepa-architecture.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/echojepa-architecture.png" alt="EchoJEPA architecture diagram: multiple echocardiographic views are partitioned into spatio-temporal tubelets and split into masked and unmasked video frames. The encoder processes visible (unmasked) frames, the predictor infers embeddings for masked regions using learnable mask tokens, and the EMA encoder processes unmasked frames to provide prediction targets. The L1 loss is computed between predicted and target embeddings, with no gradients flowing into the EMA branch."></a>
        </div>
        <figcaption class="figure-caption">EchoJEPA architecture. Views are split into masked and unmasked spatio-temporal tubelets; the context encoder sees only the unmasked ones, the predictor infers the masked regions' representations, and the slowly-updated EMA encoder supplies the targets it's scored against.</figcaption>
      </figure>

      <h3>Contributions</h3>
          <ul>
            <li><strong>EchoJEPA.</strong> A foundation model using latent prediction pretrained on 18 million videos across 300K patients, the largest echocardiography corpus to date, achieving state-of-the-art performance on LVEF estimation and right ventricular systolic pressure (RVSP) prediction, demonstrating that latent prediction outperforms pixel reconstruction for ultrasound.</li>
            <li><strong>Multi-view probing framework.</strong> A method using factorized video stream embeddings and attention masking to integrate information across echocardiographic views without view-specific components.</li>
            <li><strong>Unified evaluation protocol.</strong> A standardized benchmark with frozen backbones, identical probes, and consistent hyperparameter search across all baseline models, enabling fair comparison of representation quality.</li>
            <li><strong>Robustness benchmarks.</strong> Physics-informed perturbations using depth attenuation and acoustic shadow, revealing that EchoJEPA degrades 86% less than the next-best baseline under acoustic perturbations.</li>
            <li><strong>Public release.</strong> EchoJEPA-L, a state-of-the-art echocardiography foundation model trained on MIMIC-IV-Echo, is open-sourced alongside the evaluation framework at <a href="https://github.com/bowang-lab/EchoJEPA" target="_blank" rel="noopener">github.com/bowang-lab/EchoJEPA</a>.</li>
          </ul>

      <p><strong>Scale.</strong> EchoJEPA-G is pretrained on 18.1 million echocardiogram videos across 300,000 patients&mdash;the largest echo pretraining corpus assembled to date&mdash;behind a ViT-G encoder at 1.1B parameters. A smaller, publicly released variant, EchoJEPA-L, is pretrained on the 525K videos in MIMIC-IV-Echo.</p>
      <p><strong>Multi-view reasoning.</strong> A single echocardiography study isn't one video&mdash;it's a collection of clips acquired from different transducer positions (Apical 4-chamber, Parasternal long/short axis, Subcostal, and more). The encoder processes each clip on its own, with no awareness that the others exist. A separate <strong>study-level attentive probe</strong> is what fuses them: it takes the per-clip embeddings from every acquired view and combines them with cross-attention into one study embedding.</p>
      <p>Right ventricular systolic pressure is the clean test case for whether that fusion is doing real work, because it is structurally a two-view measurement:</p>
      <div class="formula">RVSP = 4 &times; (TR jet velocity)&sup2; + RA pressure<br><span style="opacity:.6">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└─────── Apical view ───────┘ &nbsp;&nbsp;└── Subcostal IVC ──┘</span></div>

      <h3>Why a standardized probe is required</h3>
          <div class="pull-quote">We introduce a standardized probing framework that fixes the probe architecture, hyperparameter search, and multi-view fusion strategy across all models, isolating representation quality as the sole variable.<cite>Why It Is Required</cite></div>
          <p>This is the design choice that makes the benchmark fair: every model being compared (EchoJEPA, EchoPrime, PanEcho, VideoMAE) uses the same probe architecture, the same LR/weight-decay sweep grid, and the same multi-view fusion strategy. The only thing that differs is the frozen encoder producing the tokens&mdash;any difference in downstream performance is therefore a difference in what the encoder learned, not in how the probe was tuned.</p>

          <figure class="figure">
            <div class="figure-frame">
              <a href="/img/blogs/echojepa/multiview-probing-framework.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/multiview-probing-framework.png" alt="Multi-view probing framework diagram: the frozen EchoJEPA encoder extracts video embeddings from multiple echocardiographic views, each view's embedding is augmented with learnable view and clip stream position encoding, and view dropout randomly masks views during training. The concatenated tokens are passed through a lightweight attentive probe that outputs study-level predictions, reaching 65% LVEF accuracy."></a>
            </div>
            <figcaption class="figure-caption">The multi-view probing framework. The frozen encoder never sees more than one clip at a time&mdash;every bit of cross-view reasoning happens in the lightweight attentive probe on top of it.</figcaption>
          </figure>
          <p>Any model that only ever probes one clip at a time is structurally incapable of getting this right, no matter how good its encoder is&mdash;which makes RVSP a useful way to tell "the encoder is strong" apart from "the whole system reasons correctly."</p>

      <h3>Inside the multi-view attentive probe</h3>
          <figure class="figure">
            <div class="figure-frame is-wide">
              <a href="/img/blogs/echojepa/excalidraw-multiview-probe-pipeline.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/excalidraw-multiview-probe-pipeline.png" alt="Hand-drawn diagram of the Multi-View Attentive Probe pipeline: input views and clips, frozen EchoJEPA encoder, concatenation, slot embeddings, three self-attention blocks, a cross-attention pooling block with a learned query token, and a linear head producing the task prediction."></a>
            </div>
            <figcaption class="figure-caption">The probe pipeline, traced end to end: each view/clip is embedded independently by the frozen encoder, tagged with learned view + clip position embeddings, mixed by self-attention across all tokens, and pooled by one cross-attending query into a single study embedding.</figcaption>
          </figure>
          <ol>
            <li>Each view/clip in a study is embedded independently by the frozen EchoJEPA encoder&mdash;it never sees the other views at this stage.</li>
            <li>The resulting per-clip token sequences are concatenated, and every token is tagged with learned view and clip-stream position embeddings.</li>
            <li>Self-attention blocks mix information across all present view-tokens.</li>
            <li>A learned query token cross-attends over the mixed tokens&mdash;this is the pooling step that turns "many clips" into one study embedding.</li>
            <li>A task-specific linear head reads out the prediction: regression for LVEF and RVSP, a 13-way softmax for view classification.</li>
            <li>During training, views are randomly dropped with probability 0.10, so the probe learns to be robust to whatever subset of views a real study happens to include.</li>
          </ol>

      <h3>Learning targets for the probe</h3>
          <p>Three tasks, each defined by a separate config. The probe head (a linear layer) is swapped per task; the 4-block transformer body is shared in design but trained separately for each.</p>
          <h4>Target 1 &mdash; LVEF (Left Ventricular Ejection Fraction)</h4>
          <p>LVEF is a single-view task&mdash;the Apical 4-chamber view captures both the LV inflow tract and outflow tract, giving enough geometry. No cross-view reasoning is needed; the probe runs single-view, not multi-view.</p>
          <h4>Target 2 &mdash; RVSP (Right Ventricular Systolic Pressure)</h4>
          <p>RVSP only uses 4 clips from 2 views:</p>
          <div class="formula">RVSP = 4 &times; (TR velocity)&sup2; + RAP<br><span style="opacity:.6">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└── from Apical ──┘&nbsp;&nbsp;└── from Subcostal ──┘</span></div>
          <p>TR velocity is the tricuspid regurgitation jet velocity (m/s), measured in the Apical view via continuous-wave Doppler. RAP is right atrial pressure (mmHg), estimated from IVC diameter and collapsibility measured in the Subcostal view. RVSP is the litmus test for whether multi-view reasoning actually works&mdash;competitors that use single-view probes cannot compute it correctly regardless of encoder quality.</p>
          <h4>Target 3 &mdash; View Classification (13 classes)</h4>
          <p>Probe output is a [B, 13] softmax over view classes, trained with cross-entropy loss. This is a per-clip task, not a study-level aggregation.</p>
          <p><strong>Note:</strong> each of the three tasks is trained and probed independently.</p>

      <h3>Datasets</h3>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Dataset</th><th>Type</th><th>Size</th><th>Used for</th></tr></thead>
              <tbody>
                <tr><td>Toronto (internal)</td><td>Proprietary, multi-view</td><td>150,000 studies</td><td>Probe training + internal validation</td></tr>
                <tr><td>Chicago (internal)</td><td>Proprietary, multi-view</td><td>60,000 studies</td><td>External holdout site (out-of-distribution)</td></tr>
                <tr><td>EchoNet-Dynamic (Stanford)</td><td>Public, single-view (A4C)</td><td>10,030 videos</td><td>LVEF cross-site evaluation; adult source for pediatric transfer</td></tr>
                <tr><td>EchoNet-Pediatric</td><td>Public, single-view</td><td>3,516 videos</td><td>Zero-shot pediatric generalization target</td></tr>
                <tr><td>MIMIC-IV-Echo</td><td>Public, multi-view</td><td>525,000 videos</td><td>EchoJEPA-L pretraining</td></tr>
                <tr><td>Proprietary (UHN)</td><td>Proprietary, multi-view</td><td>18.1M videos, 300K patients</td><td>EchoJEPA-G pretraining</td></tr>
              </tbody>
            </table>
          </div>

      <h3>Architectures</h3>
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
          </div>

    </section>

    <section>
      <h2 id="ultrasound-augmentation">Ultrasound-specific data augmentation</h2>
      <div class="pull-quote">Training deep neural networks for ultrasound image analysis presents unique challenges due to the physics of acoustic imaging. Standard augmentation techniques (rotation, flipping, color jittering) fail to capture the domain-specific artifacts and degradations inherent to ultrasound acquisition.<cite>usaugment</cite></div>
      <p>The paper uses the <strong>usaugment</strong> library (Tupper &amp; Gagn&eacute;, 2025)&mdash;physics-informed transforms designed specifically for ultrasound that integrate with the Albumentations framework. All transforms require a binary scan mask M &isin; {0,1}<sup>H&times;W</sup> that identifies the active ultrasound region (the fan-shaped sector), so augmentations are applied only to diagnostic content, not surrounding interface elements.</p>

      <h4>Depth Attenuation</h4>
      <p>Ultrasound waves lose energy as they propagate through tissue (absorption and scattering), following the acoustic attenuation equation&mdash;a multiplicative attenuation map that darkens pixels proportionally to their vertical depth.</p>

      <h4>Gaussian Shadow</h4>
      <p>Acoustic shadows occur when ribs or the sternum block the ultrasound beam, creating wedge-shaped dark regions that obscure cardiac chambers&mdash;modelled as a localized intensity reduction following a 2D Gaussian.</p>

      <h4>Haze Artifact</h4>
      <p>Near-field haze from reverberation (multiple reflections at the transducer face), side lobes (off-axis energy), and clutter (tissue motion noise) creates a foggy brightness pattern near the transducer&mdash;modelled as additive brightness concentrated near the transducer apex.</p>

      <h4>Speckle Reduction</h4>
      <p>Speckle arises from constructive and destructive interference of scattered acoustic waves. Modern scanners offer speckle reduction (spatial compounding, adaptive filtering), and clinical images exhibit varying speckle texture depending on scanner settings and operator preference&mdash;modelled as a bilateral filter that smooths speckle while preserving edges (spatial weight &times; intensity range weight).</p>
    </section>

    <section>
      <h2 id="does-it-actually-work">Does it actually work?</h2>

      <h3>Robustness evaluation protocol</h3>
          <p>Physics-informed perturbations are applied at test time only (no adversarial training) on the Stanford EchoNet-Dynamic split, across two degradation types, each with three severity levels.</p>
          <h4>Depth attenuation</h4>
          <p>Simulates signal loss with tissue depth:</p>
          <div class="formula">I'(x, y) = I(x, y) &times; max(0, 1 &minus; &alpha; &times; y/H)<br>&alpha; &isin; {0.3, 0.5, 0.7}&nbsp;&nbsp;(Low, Med, High)<br>y = vertical pixel coordinate (0 = transducer, H = deepest tissue)</div>
          <h4>Gaussian shadow</h4>
          <p>Simulates acoustic shadowing from ribs or calcification:</p>
          <div class="formula">I'(x, y) = I(x, y) &times; (1 &minus; exp(&minus;((x &minus; x<sub>0</sub>)/&sigma;)&sup2;))<br>x<sub>0</sub> = random horizontal position, uniform across image width<br>&sigma; &isin; {0.1W, 0.21W, 0.31W}&nbsp;&nbsp;(Low, Med, High)</div>
          <p>Both perturbations are applied per-frame across the full clip. Avg. Deg. in the tables below is the mean relative MAE increase from the clean baseline, averaged across all 6 perturbation conditions. The key hypothesis: latent prediction forces the encoder to ignore transient frame-level noise (speckle, shadows) and predict stable anatomical structure&mdash;making it inherently more robust than pixel reconstruction, which must faithfully model the noise itself.</p>

      <h3>Baselines</h3>
          <p>All models are evaluated with identical probes&mdash;same architecture (depth=4, 16 heads), same LR/weight-decay sweep, same multi-view fusion. The only variable is the frozen encoder.</p>
          <ul>
            <li><strong>EchoPrime</strong> &mdash; contrastive VLM, trained on 1M+ echo videos with report supervision.</li>
            <li><strong>PanEcho</strong> &mdash; contrastive model trained on 1M+ echo-report pairs.</li>
            <li><strong>EchoMAE-L</strong> &mdash; pixel reconstruction (VideoMAE objective), same ViT-L backbone as EchoJEPA-L; the direct apples-to-apples ablation of latent vs. pixel prediction.</li>
            <li><strong>EchoJEPA-L</strong> &mdash; V-JEPA 2 latent prediction, ViT-L, trained on 525K public MIMIC-IV-Echo videos.</li>
            <li><strong>EchoJEPA-G</strong> &mdash; V-JEPA 2 latent prediction, ViT-G (1.1B), trained on 18.1M proprietary echo videos.</li>
          </ul>

      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Task</th><th>Metric</th><th>EchoMAE-L<br><span style="font-weight:400;text-transform:none;letter-spacing:0">(pixel baseline)</span></th><th>EchoPrime<br><span style="font-weight:400;text-transform:none;letter-spacing:0">(text-supervised)</span></th><th>EchoJEPA-G</th><th>vs. EchoMAE-L</th><th>vs. EchoPrime</th></tr></thead>
          <tbody>
            <tr><td>LVEF (Stanford)</td><td>MAE &darr;</td><td>8.52</td><td>4.87</td><td class="hl">3.97</td><td>&minus;53%</td><td>&minus;19%</td></tr>
            <tr><td>View ID (1% labels)</td><td>Acc % &uarr;</td><td>21.8</td><td>21.6</td><td class="hl">78.6</td><td>+260%</td><td>+264%</td></tr>
            <tr><td>RVSP (Toronto)</td><td>MAE &darr;</td><td>5.36</td><td>5.65</td><td class="hl">4.54</td><td>&minus;15%</td><td>&minus;20%</td></tr>
            <tr><td>Robustness</td><td>Avg. degradation &uarr;</td><td>+0.5%&dagger;</td><td>+16.8%</td><td class="hl">+2.3%</td><td>&mdash;</td><td>&minus;86%</td></tr>
            <tr><td>Pediatric zero-shot</td><td>MAE &darr;</td><td>6.79</td><td>5.10</td><td class="hl">4.32</td><td>&minus;36%</td><td>&minus;15%</td></tr>
          </tbody>
        </table>
        <p class="table-caption">&dagger; EchoMAE-L's near-zero degradation is a floor effect&mdash;its baseline MAE (8.52) is already so poor that perturbation has little room to make it meaningfully worse.</p>
      </div>

      <p>Two comparisons are worth separating. The <strong>controlled ablation</strong>&mdash;same architecture, data, and compute&mdash;is EchoJEPA-L vs. EchoMAE-L, both ViT-L:</p>

      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Model</th><th>Objective</th><th>LVEF MAE &darr;</th><th>View Acc &uarr;</th></tr></thead>
          <tbody>
            <tr><td>EchoMAE-L</td><td>Reconstruction</td><td>8.15</td><td>40.4</td></tr>
            <tr><td>EchoJEPA-L</td><td>Latent Prediction</td><td class="hl">5.97</td><td class="hl">85.5</td></tr>
            <tr class="hl"><td>Relative improvement</td><td></td><td>&minus;26.7%</td><td>+45.1%</td></tr>
          </tbody>
        </table>
        <p class="table-caption">Controlled comparison of pretraining objectives. EchoJEPA-L and EchoMAE-L use identical architecture, data, and compute&mdash;latent prediction consistently outperforms pixel reconstruction.</p>
      </div>

      <p>The headline number&mdash;EchoJEPA-G's 53% drop in LVEF MAE against EchoMAE-L on Stanford (8.52 &rarr; 3.97)&mdash;compounds that objective difference with scale (ViT-G vs. ViT-L) and more pretraining data, so it's the best-model-vs-weakest-baseline comparison, not a controlled ablation. <strong>View classification from 1% of labels</strong> reaches 78.6% accuracy, nearly double what EchoPrime manages using every label it has (42.1%). <strong>Robustness</strong> under simulated depth attenuation and acoustic shadow costs EchoJEPA-G +2.3%, against +16.8% for EchoPrime. And on <strong>pediatric hearts</strong>, EchoJEPA-G's zero-shot number (4.32 MAE, no pediatric training data at all) beats EchoPrime's number after EchoPrime was given pediatric fine-tuning data (4.53 MAE).</p>

      <p>There's a qualitative result underneath those tables that's easy to miss: EchoJEPA-G forms distinct, well-separated clusters for different anatomical views (e.g., PLAX, A4C), and notably segregates transesophageal (TEE) echocardiograms into a discrete cluster separate from standard transthoracic (TTE) views&mdash;indicating that latent prediction disentangles acquisition modalities without explicit supervision. Baselines such as EchoMAE-L (reconstruction), EchoPrime (contrastive), and PanEcho (labeled supervised in this specific comparison) exhibit diffuse embedding spaces where TTE and TEE views are largely intermixed.</p>

      <figure class="figure">
        <div class="figure-frame is-wide">
          <a href="/img/blogs/echojepa/umap-latent-space.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/umap-latent-space.png" alt="UMAP visualization of frozen video representations colored by echocardiographic view, for five models. The baseline models on the left show diffuse point distributions with significant overlap between view categories. The EchoJEPA models on the right form distinct, well-separated anatomical clusters, including a clear separation of Transesophageal (TEE) views from Transthoracic views."></a>
        </div>
        <figcaption class="figure-caption">UMAP of frozen video representations, colored by view. Baselines (left) show diffuse, overlapping clusters&mdash;correlating with their lower probe accuracy. EchoJEPA (right) forms distinct anatomical clusters, including a clean split between transesophageal and transthoracic views.</figcaption>
      </figure>

      <p>A second qualitative signal points the same way. The deck's attention visualization compares VideoMAE against V-JEPA on three frames from an apical four-chamber echocardiogram, under both pretrained and finetuned conditions. Finetuned V-JEPA localizes precisely on the mitral valve leaflets and ventricular walls, synchronized with cardiac motion, while VideoMAE's attention stays comparatively diffuse.</p>

      <figure class="figure">
        <div class="figure-frame is-wide">
          <a href="/img/blogs/echojepa/attention-visualization.png" target="_blank" rel="noopener"><img src="/img/blogs/echojepa/attention-visualization.png" alt="Attention visualization comparing VideoMAE and V-JEPA on three frames from an apical four-chamber echocardiogram. Rows display received attention and given attention for each model under pretrained and finetuned conditions. Finetuned V-JEPA in the bottom row shows precise localization on valve leaflets and ventricular walls, synchronized with cardiac motion."></a>
        </div>
        <figcaption class="figure-caption">Received and given attention, VideoMAE vs. V-JEPA, across three frames of a cardiac cycle. Finetuned V-JEPA (bottom) localizes tightly on valve leaflets and ventricular walls, tracking them as they move.</figcaption>
      </figure>

      <h3>The full benchmark tables</h3>
          <h4>Task 1 &mdash; LVEF estimation (MAE &darr;, lower is better)</h4>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Model</th><th>Toronto</th><th>Chicago</th><th>Stanford</th></tr></thead>
              <tbody>
                <tr><td>EchoPrime</td><td>5.33</td><td>6.71</td><td>4.87</td></tr>
                <tr><td>PanEcho</td><td>5.43</td><td>6.52</td><td>5.10</td></tr>
                <tr><td>EchoMAE-L</td><td>8.15</td><td>9.40</td><td>8.52</td></tr>
                <tr><td>EchoJEPA-L</td><td>5.19</td><td>7.39</td><td>4.68</td></tr>
                <tr><td>EchoJEPA-G</td><td class="hl">4.26</td><td class="hl">5.44</td><td class="hl">3.97</td></tr>
              </tbody>
            </table>
            <p class="table-caption">Probes trained on Toronto only; Chicago and Stanford are out-of-distribution sites. EchoJEPA-G's Chicago gap over Toronto (5.44 vs. 4.26) is smaller than EchoPrime's (6.71 vs. 5.33)&mdash;better cross-site generalization, not just a better in-distribution number.</p>
          </div>
          <h4>Task 2 &mdash; view classification sample efficiency (accuracy % &uarr;)</h4>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Model</th><th>1% labels</th><th>10% labels</th><th>100% labels</th></tr></thead>
              <tbody>
                <tr><td>EchoPrime</td><td>21.6</td><td>32.0</td><td>42.1</td></tr>
                <tr><td>PanEcho</td><td>57.5</td><td>73.0</td><td>41.9</td></tr>
                <tr><td>EchoMAE-L</td><td>21.8</td><td>34.5</td><td>40.4</td></tr>
                <tr><td>EchoJEPA-L</td><td>57.5</td><td>80.0</td><td>85.5</td></tr>
                <tr><td>EchoJEPA-G</td><td class="hl">78.6</td><td class="hl">84.4</td><td class="hl">87.1</td></tr>
              </tbody>
            </table>
            <p class="table-caption">EchoMAE-L collapses at low label counts (21.8% at 1%)&mdash;pixel-reconstruction representations need far more supervision to become task-usable than latent ones do.</p>
          </div>
          <h4>Task 3 &mdash; multi-view RVSP estimation (MAE mmHg &darr;)</h4>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Model</th><th>Toronto</th><th>Chicago</th></tr></thead>
              <tbody>
                <tr><td>EchoPrime</td><td>5.65</td><td>5.29</td></tr>
                <tr><td>PanEcho</td><td>5.49</td><td>5.26</td></tr>
                <tr><td>EchoMAE-L</td><td>5.36</td><td>5.60</td></tr>
                <tr><td>EchoJEPA-L</td><td>5.01</td><td>5.05</td></tr>
                <tr><td>EchoJEPA-G</td><td class="hl">4.54</td><td class="hl">4.91</td></tr>
              </tbody>
            </table>
            <p class="table-caption">RVSP requires fusing the Apical view (TR jet velocity) with the Subcostal view (IVC diameter) via the modified Bernoulli equation&mdash;no single view can compute it alone. EchoJEPA-G improves by 17% vs. EchoMAE-L (the direct pixel-reconstruction ablation), and ~15% vs. EchoPrime.</p>
          </div>
          <h4>Task 4 &mdash; robustness to acoustic degradation (LVEF MAE on Stanford &darr;)</h4>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Model</th><th>Original</th><th>Depth att. (hi)</th><th>Gaussian shadow (hi)</th><th>Avg. degradation</th></tr></thead>
              <tbody>
                <tr><td>EchoPrime</td><td>4.87</td><td>5.91</td><td>5.78</td><td>+16.8%</td></tr>
                <tr><td>PanEcho</td><td>5.10</td><td>5.46</td><td>5.38</td><td>+3.7%</td></tr>
                <tr><td>EchoMAE-L</td><td>8.52</td><td>8.58</td><td>8.57</td><td>+0.5%&dagger;</td></tr>
                <tr><td>EchoJEPA-L</td><td>5.76</td><td>6.10</td><td>5.97</td><td>+2.3%</td></tr>
                <tr><td>EchoJEPA-G</td><td class="hl">3.97</td><td class="hl">4.17</td><td class="hl">4.07</td><td class="hl">+2.3%</td></tr>
              </tbody>
            </table>
            <p class="table-caption">Perturbations are physics-informed: depth attenuation is a linear intensity ramp along beam depth; Gaussian shadow is a horizontal band of reduced intensity simulating acoustic shadowing from ribs or calcification. Both are applied per-frame, test-time only, no adversarial training.</p>
          </div>
          <h4>Task 5 &mdash; zero-shot pediatric generalization (LVEF MAE &darr;)</h4>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Model</th><th>Zero-shot</th><th>Fine-tuned</th></tr></thead>
              <tbody>
                <tr><td>EchoPrime</td><td>5.10</td><td>4.53</td></tr>
                <tr><td>PanEcho</td><td>5.66</td><td>5.34</td></tr>
                <tr><td>EchoMAE-L</td><td>6.79</td><td>6.75</td></tr>
                <tr><td>EchoJEPA-L</td><td>6.31</td><td>5.12</td></tr>
                <tr><td>EchoJEPA-G</td><td class="hl">4.32</td><td class="hl">3.88</td></tr>
              </tbody>
            </table>
            <p class="table-caption">Probes are trained only on adult EchoNet-Dynamic and evaluated cold on EchoNet-Pediatric. EchoMAE-L barely benefits from fine-tuning (6.79 &rarr; 6.75), suggesting its representations don't transfer at all; EchoJEPA-L improves substantially (6.31 &rarr; 5.12), consistent with latent representations encoding transferable anatomy rather than acquisition-specific texture.</p>
          </div>

    </section>

    <section>
      <h2 id="what-this-means-going-forward">What this means going forward</h2>
      <p>In November 2025, LeCun announced his departure from Meta after twelve years&mdash;five as FAIR's founding director, seven as Chief AI Scientist&mdash;to co-found Advanced Machine Intelligence Labs (AMI Labs) in Paris. AMI Labs targets industrial, robotic, and healthcare applications using JEPA-based learning from video and sensor data; the fundraise signals investor confidence that world models&mdash;not LLM-style next-token prediction&mdash;are the path forward.</p>
      <p>The JEPA family has fanned out quickly since. LLM-JEPA applies the objective to language, predicting latent token-sequence representations instead of the next token, and outperforms standard LLM training objectives. LeJEPA is a leaner, theoretically grounded reformulation of the whole framework that removes ad-hoc heuristics. ACT-JEPA conditions on actions for efficient policy representation learning in robotics. VL-JEPA predicts continuous text embeddings for vision-language tasks instead of generating tokens autoregressively. US-JEPA generalizes the approach to ultrasound imaging in general, learning anatomical dependencies and tissue-texture relationships across multiple ultrasound modalities. And V-JEPA 2.1 pushes denser spatiotemporal features out of the original video model, setting new marks on Ego4D and EPIC-KITCHENS.</p>

      <h3>The JEPA family, as of this writing</h3>
          <div class="table-wrap">
            <table class="blog-table">
              <thead><tr><th>Paper</th><th>arXiv</th><th>Date</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td>LLM-JEPA</td><td><a href="https://arxiv.org/abs/2509.14252" target="_blank" rel="noopener">2509.14252</a></td><td>Oct 2025</td><td>JEPA objective for LLMs&mdash;predicts latent representations of token sequences rather than tokens themselves; outperforms standard LLM training objectives</td></tr>
                <tr><td>LeJEPA</td><td><a href="https://arxiv.org/abs/2511.08544" target="_blank" rel="noopener">2511.08544</a></td><td>Nov 2025</td><td>"Lean JEPA"&mdash;a theoretically grounded reformulation removing ad-hoc heuristics; scalable and clean</td></tr>
                <tr><td>ACT-JEPA</td><td><a href="https://arxiv.org/abs/2501.14622" target="_blank" rel="noopener">2501.14622</a></td><td>Jan 2026</td><td>Action-conditioned JEPA for efficient policy representation learning in robotics</td></tr>
                <tr><td>Value-guided JEPA planning</td><td><a href="https://arxiv.org/abs/2601.00844" target="_blank" rel="noopener">2601.00844</a></td><td>Dec 2025</td><td>Adds value shaping to the JEPA world model's representation space to enable planning</td></tr>
                <tr><td>VL-JEPA</td><td><a href="https://arxiv.org/abs/2512.10942" target="_blank" rel="noopener">2512.10942</a></td><td>Feb 2026</td><td>Vision-language model predicting continuous text embeddings instead of autoregressive token generation&mdash;50% fewer trainable parameters, 2.85&times; fewer operations at inference via selective decoding</td></tr>
                <tr><td>US-JEPA</td><td><a href="https://arxiv.org/abs/2602.19322" target="_blank" rel="noopener">2602.19322</a></td><td>Feb 2026</td><td>JEPA applied to general ultrasound imaging&mdash;learns anatomical dependencies and tissue-texture relationships across multiple ultrasound modalities</td></tr>
                <tr><td>V-JEPA 2.1</td><td><a href="https://arxiv.org/abs/2603.14482" target="_blank" rel="noopener">2603.14482</a></td><td>Mar 2026</td><td>Unlocks denser spatiotemporal features from V-JEPA 2&mdash;state of the art on Ego4D (7.71 mAP) and EPIC-KITCHENS (40.8 Recall@5)</td></tr>
              </tbody>
            </table>
          </div>

    </section>

    <section class="sources" id="sources">
      <h2>Sources</h2>
      <ol>
        <li><a href="https://www.thesingularityproject.ai/p/yann-lecuns-joint-embedding-predictive" target="_blank" rel="noopener">Yann LeCun's Joint Embedding Predictive Architecture (JEPA) and the General Theory of Intelligence</a></li>
        <li><a href="https://ai.meta.com/blog/yann-lecun-ai-model-i-jepa/" target="_blank" rel="noopener">I-JEPA: The first AI model based on Yann LeCun's vision for more human-like AI</a></li>
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
