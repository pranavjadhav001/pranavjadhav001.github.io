---
layout: blog
permalink: /blogs/unraveling-paligemma/
title: 'Unraveling PaliGemma'
lead: "Notes on PaliGemma, a lightweight open vision-language model built from SigLIP and Gemma."
date: 2026-09-12
mathjax: true
code: false
social_image: /img/blogs/paligemma-3b/paligemma-social.png
---

<div class="back-link-wrap"><a class="back-link" href="/">&larr; Home</a></div>

<div class="page">

  <header class="masthead">
    <div>
      <div class="eyebrow">Gemma family &middot; vision&ndash;language models</div>
      <h1>Unraveling PaliGemma</h1>
      <p class="subtitle">A Peek at lightweight, open VLM along with deep dive in LLM internals.</p>
      <p class="meta-line"><b>Model notes</b><span class="sep">&middot;</span>PaliGemma &middot; LLM &middot; SigLIP &middot; RoPE &middot; KV-Cache</p>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>

  <nav class="toc" aria-label="Table of contents">
    <p class="toc-title">Contents</p>
    <ol>
      <li><a href="#venturing-into-the-unknown">Venturing into the Unknown</a></li>
      <li><a href="#what-all-it-can-do">What all it can do</a>
        <ol>
          <li><a href="#image-captioning">Image Captioning</a></li>
          <li><a href="#visual-question-answering">Visual Question Answering</a></li>
          <li><a href="#detection">Detection</a></li>
          <li><a href="#referring-expression-segmentation">Referring Expression Segmentation</a></li>
          <li><a href="#document-understanding">Document Understanding</a></li>
        </ol>
      </li>
      <li><a href="#paligemma-architecture">PaliGemma Architecture</a></li>
      <li><a href="#siglip">SigLip</a>
        <ol>
          <li><a href="#before-siglip-there-was-clip">Before SigLip there was CLIP</a></li>
          <li><a href="#how-clip-works">How CLIP Works</a></li>
          <li><a href="#problem-with-clip">Problem with CLIP</a></li>
          <li><a href="#why-do-we-need-pooling">Why do we need pooling</a></li>
          <li><a href="#siglip-so400m-vision-encoder">SigLIP-So400m Vision Encoder</a></li>
          <li><a href="#pre-norm-vs-post-norm">Pre Norm Vs Post Norm</a></li>
          <li><a href="#but-what-about-activations">But what about activations</a></li>
        </ol>
      </li>
      <li><a href="#multi-modal-projector">Multi-Modal Projector</a></li>
      <li><a href="#gemma-2b">Gemma-2B</a>
        <ol>
                    <li><a href="#gemma-2b-architecture">Gemma-2B Architecture</a></li>
        </ol>
      </li>
      <li><a href="#attention-is-all-you-need">Attention Is All You Need</a>
        <ol>
          <li><a href="#self-attention">Self Attention</a></li>
          <li><a href="#mha">Expanding with Multi-Head Attention (MHA)</a></li>
          <li><a href="#mqa-emergence">Emergence of Multi-Query Attention (MQA)</a>
            <ol>
              <li><a href="#kv-cache">But What Is a KV Cache?</a></li>
              <li><a href="#memory-time-footprint">Memory and Compute Footprint: Self-Attention vs. MHA vs. MQA</a></li>
            </ol>
          </li>
        </ol>
      </li>
      <li><a href="#tokenizer-vs-embedding">Tokenizer vs. Embedding Table</a>
        <ol>
          <li><a href="#tokenizer-step">Tokenizer: Text &rarr; Token IDs</a></li>
          <li><a href="#embedding-step">Embedding Table: Token IDs &rarr; Vectors</a></li>
          <li><a href="#weight-tying">Weight Tying</a></li>
        </ol>
      </li>
      <li><a href="#positional-embeddings">Positional Embeddings</a>
        <ol>
                    <li><a href="#absolute-vs-relative">Absolute Positional Embeddings</a></li>
                    <li><a href="#relative-embeddings">Relative Positional Embeddings</a></li>
          <li><a href="#rope">Rotary Positional Embedding (RoPE)</a></li>
        </ol>
      </li>
      <li><a href="#attention-mask">Attention Mask</a>
        <ol>
          <li><a href="#prefill-vs-decode">Prefill vs. Decode</a></li>
          <li><a href="#how-paligemma-masks">How PaliGemma Does Masking</a></li>
        </ol>
      </li>
      <li><a href="#image-detection-segmentation-tokens">Special Tokens</a>
        <ol>
          <li><a href="#detection-tokens">Object Detection: Location Tokens</a></li>
          <li><a href="#segmentation-tokens">Segmentation: Segment Tokens</a></li>
        </ol>
      </li>
      <li><a href="#training-stages">Training Stages / Phases</a>
        <ol>
          <li><a href="#stage0">Stage0: Unimodal Pretraining</a></li>
          <li><a href="#stage1">Stage1: Multimodal Pretraining</a></li>
          <li><a href="#stage2">Stage2: Resolution Increase</a></li>
          <li><a href="#stage3">Stage3: Transfer</a></li>
        </ol>
      </li>
      <li><a href="#not-instruction-tuned-intro">Why PaliGemma Is Not an Instruction-Tuned Model</a></li>
      <li><a href="#results">Results</a></li>
      <li><a href="#lingering-thoughts">Lingering Thoughts</a></li>
      <li><a href="#sources">Sources</a></li>
    </ol>
  </nav>

  <div class="prose">

    <figure class="figure" style="max-width:900px;margin:0 auto 2rem;">
      <img src="/img/blogs/paligemma-3b/paligemma-teaser.gif" alt="Animated teaser: a photo of a cat licking its paw is split into a patch grid on the left, labeled Image Patches, while the prompt 'what is the cat doing' and the generated answer 'the cat is licking its paw' build on the right. As each answer word is generated, matching image patches light up -- the cat's head for 'cat', its mouth for 'licking', its paw for 'paw' -- while filler words like 'the' and 'is' light up the whole image faintly." style="display:block;width:100%;height:auto;border-radius:18px;">
      <figcaption class="figure-caption" style="text-align:center;">How PaliGemma sees a good orange boi</figcaption>
    </figure>

    <section style="margin-bottom: 1.5rem;">
      <h2 id="venturing-into-the-unknown">Venturing into the Unknown</h2>
      <p>Coming from the medical domain and working especially with images, videos, and text modality, I've lately been intrigued by Visual-Language models. I started out trying to understand the whole field, but the industry has moved so fast over the last 3-4 years that just looking at the below contents overwhelmed me.</p>
      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/paligemma-3b/vlm-toc-scroll.gif" alt="Scrolling through the table of contents of a Vision-Language Models primer, showing dozens of sections covering VLM architectures, tasks, safety, and any-to-any models.">
        </div>
        <figcaption class="figure-caption">Fig. 1. Just the table of contents for VLMs today. Source: <a href="https://aman.ai/primers/ai/VLM/" target="_blank" rel="noopener">aman.ai/primers/ai/VLM</a>.</figcaption>
      </figure>
      <p>So instead, I picked one architecture to go deep on: <strong>PaliGemma</strong>. It's small, fully open with its weights and its detailed paper, made it easy for me to try it out locally. This is a long form blog covering not just Paligemma but also internals about attention mechanism, positional embeddings, layernorm(s), KV cache and many others. 
<br>PaliGemma is a <strong>lightweight VLM</strong> (3 Billion Parameters in total) from Google. It utilizes open pretrained components like SigLIP image encoder and Gemma Language model.
  It takes a image and a text as inputs and produces a text response token by token.
      </p>
    </section>

    <section>
      <h2 id="what-all-it-can-do">What all it can do</h2>
      <p>Before I start explaining the architecture, training recipe of the paligemma - let's look at what it offers. It's incredible how such a small vlm is capable of solving so many visual tasks like segmentation, object detection, image captioning , ocr - naming a few.</p>
      <h3 id="image-captioning">Image Captioning</h3>
      <p>PaliGemma can caption images when prompted to.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/captioning.png" target="_blank" rel="noopener"><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/captioning.png" alt="Example of PaliGemma captioning an image."></a>
        </div>
        <figcaption class="figure-caption">Fig. 2. Captioning with the mix checkpoints. Source: <a href="https://huggingface.co/blog/paligemma#image-captioning" target="_blank" rel="noopener">huggingface.co/blog/paligemma</a>.</figcaption>
      </figure>

      <h3 id="visual-question-answering">Visual Question Answering</h3>
      <p>PaliGemma can answer questions about an image, simply pass your question along with the image to do so.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/vqa.png" target="_blank" rel="noopener"><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/vqa.png" alt="Example of PaliGemma answering a question about an image."></a>
        </div>
        <figcaption class="figure-caption">Fig. 3. Visual question answering with the mix checkpoints. Source: <a href="https://huggingface.co/blog/paligemma#visual-question-answering" target="_blank" rel="noopener">huggingface.co/blog/paligemma</a>.</figcaption>
      </figure>

      <h3 id="detection">Detection</h3>
      <p>PaliGemma can detect entities in an image using the <code>detect [entity]</code> prompt. It will output the location for the bounding box coordinates in the form of special <code>&lt;loc[value]&gt;</code> tokens, where <code>value</code> is a number that represents a normalized coordinate. Each detection outputs four location coordinates (y_min, x_min, y_max, x_max) followed by the detected label.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/detect.png" target="_blank" rel="noopener"><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/detect.png" alt="Example of PaliGemma detecting an entity in an image with a bounding box."></a>
        </div>
        <figcaption class="figure-caption">Fig. 4. Detection via the <code>detect [entity]</code> prompt.</figcaption>
      </figure>

      <h3 id="referring-expression-segmentation">Referring Expression Segmentation</h3>
      <p>PaliGemma mix checkpoints can also segment entities in an image when given the <code>segment [entity]</code> prompt. This is called referring expression segmentation, because we refer to the entities of interest using natural language descriptions. The output combines location and segmentation tokens that can generate segmentation masks.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/segment.png" target="_blank" rel="noopener"><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/segment.png" alt="Example of PaliGemma segmenting an entity in an image."></a>
        </div>
        <figcaption class="figure-caption">Fig. 5. Referring expression segmentation via the <code>segment [entity]</code> prompt. Source: <a href="https://huggingface.co/blog/paligemma#referring-expression-segmentation" target="_blank" rel="noopener">huggingface.co/blog/paligemma</a>.</figcaption>
      </figure>

      <h3 id="document-understanding">Document Understanding</h3>
      <p>PaliGemma mix checkpoints have great document understanding and reasoning capabilities.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/ocrqa.png" target="_blank" rel="noopener"><img src="https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/paligemma/ocrqa.png" alt="Example of PaliGemma answering a question about a document image."></a>
        </div>
        <figcaption class="figure-caption">Fig. 6. Document understanding and reasoning with the mix checkpoints. Source: <a href="https://huggingface.co/blog/paligemma#document-understanding" target="_blank" rel="noopener">huggingface.co/blog/paligemma</a>.</figcaption>
      </figure>
    </section>

    <section style="margin-bottom: 1.5rem;">
      <h2 id="paligemma-architecture">PaliGemma Architecture</h2>
      <p>Paligemma utilizes <strong>Gemma's</strong> decoder only LLM architecture for its next token prediction capabilities. It uses a image encoder and projection layer to bring images into same token space to be supplied as a prompt to the gemma. For training the authors used a <strong>pretrained SigLIP 400M vision model as image encoder and a pretrained Gemma 2B Parameter as the LLM</strong> and then jointly trained these components on various visual-textual tasks.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/image4_W4FHDmx.original.png" target="_blank" rel="noopener"><img src="https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/image4_W4FHDmx.original.png" alt="PaliGemma architecture diagram: an image is encoded by the SigLIP vision encoder into image tokens, which are concatenated with text tokens and passed into the Gemma 2B model to produce a text response."></a>
        </div>
        <figcaption class="figure-caption">Fig. 7. The joint architecture: image tokens from the vision encoder are concatenated with text tokens and passed into the Gemma 2B model. Source: <a href="https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/image4_W4FHDmx.original.png" target="_blank" rel="noopener">Google Developers Blog</a>.</figcaption>
      </figure>
    </section>

    <section>
      <h2 id="siglip">SigLip</h2>

      <h3 id="before-siglip-there-was-clip">Before SigLip there was CLIP</h3>
      <p>CLIP, short for Contrastive Language-Image Pre-training, was released by OpenAI in 2021. It trains a <strong>joint embedding space for images and text</strong> from millions of image-caption pairs, entirely self-supervised, no manual labels involved. The idea is contrastive: pull a matching image-text pair's embeddings together, and push every other pair in the batch apart.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/paligemma-3b/clip.webp" target="_blank" rel="noopener"><img src="/img/blogs/paligemma-3b/clip.webp" alt="Diagram of how CLIP's contrastive image-text matching works."></a>
        </div>
        <figcaption class="figure-caption">Fig. 8. The similarity matrix in practice: the diagonal (green) is the matching pair for each image, scored against every other text in the batch. Source: <a href="https://medium.com/self-supervised-learning/understanding-clip-for-vision-language-models-43b700a4aa2b" target="_blank" rel="noopener">Understanding CLIP for Vision-Language Models</a>.</figcaption>
      </figure>

      <h3 id="how-clip-works">How CLIP Works</h3>
      <p>An image encoder and a text encoder turn a batch's images and texts into image and text embeddings. Every image embedding is dot-producted against every text embedding in the batch, after L2-normalizing both, producing a full image-by-text similarity matrix. The correct pairs sit on the diagonal, so the ground truth is just an identity matrix: image <code>i</code> should score high only against text <code>j</code> where <code>i==j</code>, and low against every other text in the batch.</p>
      <p>Training this is a multiple-choice test repeated for every image: given all the texts in the batch, pick out the one that actually matches. Because each row is scored against every option at once. This is the first component of the loss. If you look closely it is a softmax function where you maximize the probability of the rightful dot product of image-text pair in that row.</p>
      <p>Just like the images we will compute for text as well that will be using column wise softmax.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="https://miro.medium.com/v2/resize:fit:720/format:webp/1*gUcO19FwJZ1us88wYmcr0w.png" target="_blank" rel="noopener"><img src="https://miro.medium.com/v2/resize:fit:720/format:webp/1*gUcO19FwJZ1us88wYmcr0w.png" alt="The CLIP softmax loss formula."></a>
        </div>
        <figcaption class="figure-caption">Fig. 9. The CLIP softmax loss.</figcaption>
      </figure>

      <h3 id="problem-with-clip">Problem with CLIP</h3>
      <p>All of the softmax functions in implementation are essentially "safe-softmax" in which you subtract the row maximum before exponentiation. This avoids the <strong>numerical stability issues</strong> which can happen with exponentials.</p>
      <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 1.</p>
      <div class="formula">$$\text{softmax}(x_i) = \frac{\exp(x_i)}{\sum_j \exp(x_j)}$$
      $$\text{safe softmax}(x_i) = \frac{\exp(x_i - \max(x))}{\sum_j \exp(x_j - \max(x))}$$</div>
      <p>In CLIP, the loss includes both text&rarr;image and image&rarr;text terms, which means two separate softmax computations: across images (columns) and across texts (rows). For numerical stability, <strong>you also need to scan max values twice (and often do two all-gathers)</strong>. In other words, the softmax loss (or the image&ndash;text matrix shown below) is <strong>asymmetric, hard to parallelize, computationally expensive and harder to scale your batch across multiple GPUs</strong>.</p>
      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/paligemma-3b/siglip-loss-comparison.svg" target="_blank" rel="noopener"><img src="/img/blogs/paligemma-3b/siglip-loss-comparison.svg" alt="Comparison of the CLIP softmax loss and the SigLIP sigmoid loss."></a>
        </div>
        <figcaption class="figure-caption">Fig. 10. CLIP vs. SigLIP loss, side by side. Reference: <a href="https://www.laura-martel.com/blog/siglip-sigmoid-loss-explained" target="_blank" rel="noopener">laura-martel.com/blog/siglip-sigmoid-loss-explained</a></figcaption>
      </figure>
      <p><strong>SigLIP</strong> reframes the CLIP's multiclass classification as a <strong>many binary classification tasks</strong>. CLIP taught image and text encoders to agree with each other by making every pair in a batch compete against every other pair. SigLIP asks a much smaller question of each pair, one at a time: is this image-text pair a match, yes or no?</p>
      <p>SigLIP proposes replacing it with a sigmoid loss. Under this framing, each image&ndash;text pair's loss can be computed independently, without a global normalization factor. Each image&ndash;text dot product becomes an independent binary classification task.</p>
      <figure class="figure">
        <div class="formula">$$\mathcal{L} = -\frac{1}{n}\sum_{i=1}^{n}\sum_{j=1}^{n}\log \sigma(y_{ij} z_{ij})$$</div>
        <figcaption class="figure-caption">Formula 2. The SigLIP loss. $\mathcal{L}$ is the total loss over a batch of $n$ image&ndash;text pairs. $z_{ij} = \alpha \cdot I_i^\top T_j + b$ is the similarity score between image $i$ and text $j$ ($\alpha$ a learned scale, $b$ a learned bias). $y_{ij}$ is the ground truth: $+1$ if $i = j$ (a true pair), $-1$ otherwise. $\sigma$ is the sigmoid function, so each term scores one image&ndash;text pair as an independent yes/no match.</figcaption>
      </figure>
      <p>With this optimization, you can scale batch size up to one million, and since computation is device-independent, it parallelizes nicely.</p>

      <h3 id="why-do-we-need-pooling">Why do we need pooling</h3>
      <p>As you will notice in the next section, the vision encoder returns <code>(B, seq_len, dim)</code> while SigLIP's contrastive loss operates on <code>(B, dim)</code>. You can't dot-product a sequence against another sequence and get one similarity score per image, so you need a mechanism to pool <code>(B, seq_len, dim)</code> down to <code>(B, dim)</code>. It can be done in two ways:</p>
      <ul>
        <li><strong>CLS-token pooling</strong> (original CLIP): prepend a learnable <code>[CLS]</code> token to the patch sequence; after the transformer, take only that token's output as the image embedding.</li>
      </ul>

      <div class="diagram-wrap">
        <figure>
<svg viewBox="0 0 900 500" role="img" aria-label="CLS-token pooling: a learnable CLS token is prepended to the 256 patch tokens, the combined 257-token sequence passes through the transformer encoder, and the output is an array of 257 tokens: CLS, p1, p2, ... p256. Only the CLS token's output, dimension B by dim, is kept; the patch-token outputs are discarded.">
<defs>
  <marker id="cls-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="cls-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="11" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="60,20 320,20 332,74 48,74" filter="url(#cls-rough)"/>
<text x="190" y="45" class="lbl" text-anchor="middle">Patch Tokens</text>
<text x="190" y="63" class="sub" text-anchor="middle">(B, 256, dim)</text>
<polygon class="term" points="580,20 840,20 852,74 568,74" filter="url(#cls-rough)"/>
<text x="710" y="45" class="lbl" text-anchor="middle">[CLS] Token</text>
<text x="710" y="63" class="sub" text-anchor="middle">learnable, (1, dim)</text>
<line x1="190" y1="74" x2="450" y2="130" class="arrow" marker-end="url(#cls-arrowhead)"/>
<line x1="710" y1="74" x2="450" y2="130" class="arrow" marker-end="url(#cls-arrowhead)"/>
<rect class="proc" x="250" y="130" width="400" height="64" rx="10" filter="url(#cls-rough)"/>
<text x="450" y="158" class="lbl" text-anchor="middle">Prepend CLS Token</text>
<text x="450" y="178" class="sub" text-anchor="middle">concat along sequence dim, position 0</text>
<line x1="450" y1="194" x2="450" y2="230" class="arrow" marker-end="url(#cls-arrowhead)"/>
<rect x="380" y="204" width="140" height="22" rx="6" class="shapepill"/>
<text x="450" y="219" class="shapetxt" text-anchor="middle">(B, 257, dim)</text>
<rect class="proc" x="200" y="230" width="500" height="100" rx="10" filter="url(#cls-rough)"/>
<text x="450" y="266" class="lbl" text-anchor="middle">Transformer Encoder</text>
<text x="450" y="286" class="sub" text-anchor="middle">L self-attention + MLP layers</text>
<text x="450" y="304" class="sub" text-anchor="middle">(SigLIP ViT backbone)</text>
<line x1="450" y1="330" x2="450" y2="366" class="arrow" marker-end="url(#cls-arrowhead)"/>
<rect x="380" y="340" width="140" height="22" rx="6" class="shapepill"/>
<text x="450" y="355" class="shapetxt" text-anchor="middle">(B, 257, dim)</text>
<rect class="proc" x="180" y="366" width="90" height="54" rx="6" filter="url(#cls-rough)"/>
<text x="225" y="398" class="shapetxt" text-anchor="middle">CLS</text>
<rect class="proc" x="270" y="366" width="90" height="54" rx="6" filter="url(#cls-rough)"/>
<text x="315" y="398" class="sub" text-anchor="middle">p1</text>
<rect class="proc" x="360" y="366" width="90" height="54" rx="6" filter="url(#cls-rough)"/>
<text x="405" y="398" class="sub" text-anchor="middle">p2</text>
<rect class="proc" x="450" y="366" width="90" height="54" rx="6" filter="url(#cls-rough)"/>
<text x="495" y="398" class="sub" text-anchor="middle">&#8943;</text>
<rect class="proc" x="540" y="366" width="90" height="54" rx="6" filter="url(#cls-rough)"/>
<text x="585" y="398" class="sub" text-anchor="middle">p255</text>
<rect class="proc" x="630" y="366" width="90" height="54" rx="6" filter="url(#cls-rough)"/>
<text x="675" y="398" class="sub" text-anchor="middle">p256</text>
<path d="M 195 432 C 205 432, 215 450, 225 450 C 235 450, 245 432, 255 432" class="skip" fill="none"/>
<text x="225" y="470" class="shapetxt" text-anchor="middle">(B, dim)</text>
<path d="M 300 432 C 350 432, 445 450, 495 450 C 545 450, 640 432, 690 432" class="skip" fill="none"/>
<text x="495" y="470" class="sub" text-anchor="middle">discard</text>
</svg>
          <figcaption>Fig. 11. CLS Token pooling.</figcaption>
        </figure>
      </div>

      <ul style="margin-top: 1.2rem;">
        <li><strong>Attention pooling</strong> (what SigLIP actually uses, a "MAP head", multihead attention pooling): a small learned query attends over all patch tokens and produces a single pooled vector. No CLS token needed.</li>
      </ul>

      <div class="diagram-wrap">
        <figure>
<svg viewBox="0 0 900 480" role="img" aria-label="Attention pooling, the MAP head SigLIP actually uses: the 256 patch tokens form the Key (and Value) matrix, and a small learned query vector forms the Query matrix. Scaled dot-product attention over Q and K produces a single pooled B by 1 by dim output which is squeezed to B by dim.">
<defs>
  <marker id="map-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="map-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="23" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="160,20 440,20 454,74 146,74" filter="url(#map-rough)"/>
<text x="300" y="45" class="lbl" text-anchor="middle">Patch Tokens</text>
<text x="300" y="63" class="sub" text-anchor="middle">(B, 256, dim), from encoder</text>
<rect class="proc" x="580" y="20" width="220" height="54" rx="10" filter="url(#map-rough)"/>
<text x="690" y="42" class="lbl" text-anchor="middle">Learned Query</text>
<text x="690" y="60" class="sub" text-anchor="middle">(1, dim), trainable param</text>
<line x1="300" y1="74" x2="300" y2="140" class="arrow" marker-end="url(#map-arrowhead)"/>
<line x1="690" y1="74" x2="690" y2="140" class="arrow" marker-end="url(#map-arrowhead)"/>
<polygon class="term" points="180,140 420,140 434,186 166,186" filter="url(#map-rough)"/>
<text x="300" y="168" class="lbl" text-anchor="middle">K (Patch Tokens)</text>
<polygon class="term" points="570,140 810,140 824,186 556,186" filter="url(#map-rough)"/>
<text x="690" y="168" class="lbl" text-anchor="middle">Q (Learned Query)</text>
<line x1="300" y1="186" x2="300" y2="230" class="arrow" marker-end="url(#map-arrowhead)"/>
<line x1="690" y1="186" x2="690" y2="230" class="arrow" marker-end="url(#map-arrowhead)"/>
<rect class="proc" x="150" y="230" width="600" height="90" rx="10" filter="url(#map-rough)"/>
<text x="450" y="266" class="lbl" text-anchor="middle">Scaled Dot-Product Attention (pooling)</text>
<text x="450" y="286" class="sub" text-anchor="middle">softmax(QK&#7488;/&radic;d)&middot;V</text>
<text x="450" y="304" class="sub" text-anchor="middle">K = V = Patch Tokens; Q = Learned Query</text>
<line x1="450" y1="320" x2="450" y2="356" class="arrow" marker-end="url(#map-arrowhead)"/>
<rect x="380" y="330" width="140" height="22" rx="6" class="shapepill"/>
<text x="450" y="345" class="shapetxt" text-anchor="middle">(B, 1, dim)</text>
<rect class="proc" x="300" y="356" width="300" height="56" rx="10" filter="url(#map-rough)"/>
<text x="450" y="384" class="lbl" text-anchor="middle">Squeeze</text>
<text x="450" y="402" class="sub" text-anchor="middle">(B, 1, dim) &rarr; (B, dim)</text>
<line x1="450" y1="412" x2="450" y2="454" class="arrow" marker-end="url(#map-arrowhead)"/>
<rect x="380" y="422" width="140" height="22" rx="6" class="shapepill"/>
<text x="450" y="437" class="shapetxt" text-anchor="middle">(B, dim)</text>
</svg>
          <figcaption>Fig. 12. Attention pooling.</figcaption>
        </figure>
      </div>

      <h3 id="siglip-so400m-vision-encoder">SigLIP-So400m Vision Encoder</h3>

        <div class="diagram-wrap">
          <div class="legend">
            <div class="legend-item"><span class="swatch module"></span>module / op</div>
            <div class="legend-item"><span class="swatch repeat"></span>repeated block (&times; N, stacked)</div>
            <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
            <div class="legend-item"><span class="swatch add"></span>&oplus; residual add</div>
          </div>

          <figure>
            <svg viewBox="0 0 780 2100" role="img" aria-label="Diagram of the SigLIP-So400m vision encoder showing tensor shapes at each stage, from a 224 by 224 by 3 input image through patch embedding, learned position embeddings added via a residual-style plus node, 27 stacked encoder layers each with pre-norm multi-head attention and an MLP block, to a final 256 by 1152 sequence after post_layernorm.">
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
              <polygon class="term" points="258.0,91 520.0,91 502.0,145 240.0,145" filter="url(#rough)"/><text x="380" y="123.0" class="lbl" text-anchor="middle">Input Image</text>
              <line x1="380" y1="145" x2="380" y2="187" class="arrow" marker-end="url(#arrowhead)"/><rect x="321.3" y="159.0" width="117.4" height="22" rx="6" class="shapepill"/><text x="380" y="174.0" class="shapetxt" text-anchor="middle">[B, 3, 224, 224]</text>
              <rect class="proc" x="220.0" y="195" width="320" height="64" rx="10" filter="url(#rough)"/><text x="380" y="223.0" class="lbl" text-anchor="middle">Patch Embedding</text><text x="380" y="243.0" class="sub" text-anchor="middle">Conv2d  3&rarr;1152, kernel=14, stride=14</text>
              <line x1="380" y1="259" x2="380" y2="301" class="arrow" marker-end="url(#arrowhead)"/><rect x="318.1" y="273.0" width="123.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="288.0" class="shapetxt" text-anchor="middle">[B, 1152, 16, 16]</text>
              <rect class="proc" x="220.0" y="309" width="320" height="64" rx="10" filter="url(#rough)"/><text x="380" y="337.0" class="lbl" text-anchor="middle">Flatten + Transpose</text><text x="380" y="357.0" class="sub" text-anchor="middle">(B,1152,16,16) &rarr; (B,256,1152)</text>
              <line x1="380" y1="373" x2="380" y2="415" class="arrow" marker-end="url(#arrowhead)"/><rect x="327.7" y="387.0" width="104.60000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="402.0" class="shapetxt" text-anchor="middle">[B, 256, 1152]</text>
              <line x1="380" y1="415" x2="380" y2="432" class="arrow" marker-end="url(#arrowhead)"/>
              <rect class="proc" x="560" y="424" width="200" height="54" rx="10" filter="url(#rough)"/><text x="660" y="447" class="lbl" text-anchor="middle">Position Embedding</text><text x="660" y="465" class="sub" text-anchor="middle">learned, (256, 1152)</text>
              <line x1="560" y1="451" x2="401" y2="451" class="arrow" marker-end="url(#arrowhead)"/>
              <circle cx="380" cy="451" r="19" class="addnode" filter="url(#rough)"/><text x="380" y="458" class="addsym" text-anchor="middle">&oplus;</text>
              <line x1="380" y1="470" x2="380" y2="512" class="arrow" marker-end="url(#arrowhead)"/><rect x="327.7" y="483" width="104.60000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="498" class="shapetxt" text-anchor="middle">[B, 256, 1152]</text>
              <line x1="380" y1="512" x2="380" y2="552" class="arrow" marker-end="url(#arrowhead)"/>
              <rect class="ghost" x="67" y="533" width="680" height="1360" rx="22" filter="url(#rough)"/><rect class="ghost" x="58" y="542" width="680" height="1360" rx="22" filter="url(#rough)"/><rect class="ghost" x="49" y="551" width="680" height="1360" rx="22" filter="url(#rough)"/><rect class="containerOuter" x="40" y="560" width="680" height="1360" rx="22" filter="url(#rough)"/><text x="62" y="590" class="clbl">SigLIP Encoder (&times; 27 Siglip Encoder Layer)</text>
              <rect class="proc" x="220.0" y="614" width="320" height="64" rx="10" filter="url(#rough)"/><text x="380" y="642.0" class="lbl" text-anchor="middle">layer_norm1  (Pre-LN)</text><text x="380" y="662.0" class="sub" text-anchor="middle">nn.LayerNorm, eps=1e-6</text>
              <line x1="380" y1="678" x2="380" y2="720" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="692.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="707.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <rect class="ghost" x="98" y="710" width="600" height="486" rx="22" filter="url(#rough)"/><rect class="ghost" x="89" y="719" width="600" height="486" rx="22" filter="url(#rough)"/><rect class="container" x="80" y="728" width="600" height="486" rx="22" filter="url(#rough)"/><text x="102" y="758" class="clbl">Multi-Head Attention (16 heads &times; 72 dim)</text>
              <rect class="proc" x="85.0" y="782" width="170" height="64" rx="10" filter="url(#rough)"/><text x="170" y="810.0" class="lbl" text-anchor="middle">q_proj</text><text x="170" y="830.0" class="sub" text-anchor="middle">1152&rarr;1152, split 16&times;72</text>
              <rect class="proc" x="295.0" y="782" width="170" height="64" rx="10" filter="url(#rough)"/><text x="380" y="810.0" class="lbl" text-anchor="middle">k_proj</text><text x="380" y="830.0" class="sub" text-anchor="middle">1152&rarr;1152, split 16&times;72</text>
              <rect class="proc" x="505.0" y="782" width="170" height="64" rx="10" filter="url(#rough)"/><text x="590" y="810.0" class="lbl" text-anchor="middle">v_proj</text><text x="590" y="830.0" class="sub" text-anchor="middle">1152&rarr;1152, split 16&times;72</text>
              <line x1="170" y1="846" x2="250" y2="884" class="arrow" marker-end="url(#arrowhead)"/>
              <line x1="380" y1="846" x2="380" y2="884" class="arrow" marker-end="url(#arrowhead)"/>
              <line x1="590" y1="846" x2="510" y2="884" class="arrow" marker-end="url(#arrowhead)"/>
              <rect x="115" y="858" width="110" height="22" rx="6" class="shapepill"/>
              <text x="170" y="873" class="shapetxt" text-anchor="middle">[B,16,256,72]</text>
              <rect x="325" y="858" width="110" height="22" rx="6" class="shapepill"/>
              <text x="380" y="873" class="shapetxt" text-anchor="middle">[B,16,256,72]</text>
              <rect x="535" y="858" width="110" height="22" rx="6" class="shapepill"/>
              <text x="590" y="873" class="shapetxt" text-anchor="middle">[B,16,256,72]</text>
              <rect class="proc" x="190.0" y="892" width="380" height="64" rx="10" filter="url(#rough)"/><text x="380" y="920.0" class="lbl" text-anchor="middle">Scaled Dot-Product Attention</text><text x="380" y="940.0" class="sub" text-anchor="middle">softmax(QK&#7488;/&radic;72)&middot;V</text>
              <line x1="380" y1="956" x2="380" y2="998" class="arrow" marker-end="url(#arrowhead)"/><rect x="330.9" y="970.0" width="98.2" height="22" rx="6" class="shapepill"/><text x="380" y="985.0" class="shapetxt" text-anchor="middle">[B,16,256,72]</text>
              <rect class="proc" x="200.0" y="1006" width="360" height="64" rx="10" filter="url(#rough)"/><text x="380" y="1034.0" class="lbl" text-anchor="middle">Concat heads + reshape</text><text x="380" y="1054.0" class="sub" text-anchor="middle">(B,16,256,72) &rarr; (B,256,1152)</text>
              <line x1="380" y1="1070" x2="380" y2="1112" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1084.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1099.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <rect class="proc" x="220.0" y="1120" width="320" height="64" rx="10" filter="url(#rough)"/><text x="380" y="1148.0" class="lbl" text-anchor="middle">out_proj</text><text x="380" y="1168.0" class="sub" text-anchor="middle">Linear 1152&rarr;1152</text>
              <line x1="380" y1="1214" x2="380" y2="1246" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1223.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1238.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <circle cx="380" cy="1274" r="19" class="addnode" filter="url(#rough)"/>
              <text x="380" y="1281" class="addsym" text-anchor="middle">&oplus;</text>
              <path d="M 380 614 C 64 614, 64 1274, 361 1274" class="skip" filter="url(#rough)" marker-end="url(#arrowhead)"/>
              <text x="58" y="944.0" class="skiplbl" text-anchor="middle" transform="rotate(-90 58 944.0)">residual</text>
              <line x1="380" y1="1293" x2="380" y2="1331" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1305.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1320.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <rect class="proc" x="220.0" y="1339" width="320" height="64" rx="10" filter="url(#rough)"/><text x="380" y="1367.0" class="lbl" text-anchor="middle">layer_norm2  (Pre-LN)</text><text x="380" y="1387.0" class="sub" text-anchor="middle">nn.LayerNorm, eps=1e-6</text>
              <line x1="380" y1="1403" x2="380" y2="1445" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1417.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1432.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <rect class="container" x="80" y="1453" width="600" height="358" rx="22" filter="url(#rough)"/><text x="102" y="1483" class="clbl">Siglip MLP</text>
              <rect class="proc" x="230.0" y="1507" width="300" height="64" rx="10" filter="url(#rough)"/><text x="380" y="1535.0" class="lbl" text-anchor="middle">fc1</text><text x="380" y="1555.0" class="sub" text-anchor="middle">Linear 1152&rarr;4304</text>
              <line x1="380" y1="1571" x2="380" y2="1609" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1583.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1598.0" class="shapetxt" text-anchor="middle">[B,256,4304]</text>
              <rect class="proc" x="230.0" y="1617" width="300" height="54" rx="10" filter="url(#rough)"/><text x="380" y="1649.0" class="lbl" text-anchor="middle">GELU  (tanh approx)</text>
              <line x1="380" y1="1671" x2="380" y2="1709" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1683.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1698.0" class="shapetxt" text-anchor="middle">[B,256,4304]</text>
              <rect class="proc" x="230.0" y="1717" width="300" height="64" rx="10" filter="url(#rough)"/><text x="380" y="1745.0" class="lbl" text-anchor="middle">fc2</text><text x="380" y="1765.0" class="sub" text-anchor="middle">Linear 4304&rarr;1152</text>
              <line x1="380" y1="1811" x2="380" y2="1843" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1820.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1835.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <circle cx="380" cy="1871" r="19" class="addnode" filter="url(#rough)"/>
              <text x="380" y="1878" class="addsym" text-anchor="middle">&oplus;</text>
              <path d="M 380 1339 C 64 1339, 64 1871, 361 1871" class="skip" filter="url(#rough)" marker-end="url(#arrowhead)"/>
              <text x="58" y="1605.0" class="skiplbl" text-anchor="middle" transform="rotate(-90 58 1605.0)">residual</text>
              <line x1="380" y1="1920" x2="380" y2="1958" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="1932.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="1947.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
              <rect class="proc" x="230.0" y="1966" width="300" height="54" rx="10" filter="url(#rough)"/><text x="380" y="1998.0" class="lbl" text-anchor="middle">post_layernorm</text>
              <line x1="380" y1="2020" x2="380" y2="2058" class="arrow" marker-end="url(#arrowhead)"/><rect x="334.1" y="2032.0" width="91.80000000000001" height="22" rx="6" class="shapepill"/><text x="380" y="2047.0" class="shapetxt" text-anchor="middle">[B,256,1152]</text>
            </svg>
            <figcaption>
              Fig. 13. SigLIP Image encoder architecture.
            </figcaption>
          </figure>
        </div>

      <h3 id="pre-norm-vs-post-norm">Pre Norm Vs Post Norm</h3>
      <p>Residual blocks were made popular by <strong>Resnets</strong> and have become a defacto for deeper stacked architectures. For a residual block $y = x + F(x)$. The gradient for x w.r.t Loss is:</p>
      <div class="formula">$$\frac{\partial L}{\partial x} = \frac{\partial L}{\partial y}\cdot\frac{\partial y}{\partial x} = \frac{\partial L}{\partial y}\left(I+\frac{\partial F}{\partial x}\right) = \frac{\partial L}{\partial y} + \frac{\partial L}{\partial y}\cdot\frac{\partial F}{\partial x}$$</div>
      <p>The gradient is a <strong>sum, not a product</strong>: the upstream gradient passes straight through unchanged (the $I$ term), plus whatever correction the branch $F$ contributes.</p>
      <p>Unroll over $L$ stacked blocks,<br> $x_l = x_{l-1}+F_l(x_{l-1})$,<br> so $x_L = x_0 + \sum_l F_l(x_{l-1})$<br> (here $x_l$ is the residual stream after block $l$, so $x_0$ is the input to the first block and $x_L$ is the final output after all $L$ blocks):</p>
      <div class="formula">$$\frac{\partial L}{\partial x_0} = \frac{\partial L}{\partial x_L}\cdot\left(1+\frac{\partial}{\partial x_0}\sum_l F_l(x_{l-1})\right)$$</div>
      <p>Compare this to a <strong>plain</strong> (non-residual) stack, $x_l = F_l(x_{l-1})$:</p>
      <div class="formula">$$\frac{\partial L}{\partial x_0} = \frac{\partial L}{\partial x_L}\cdot\prod_l \frac{\partial F_l}{\partial x_{l-1}}$$</div>
      <p>That's a <em>product</em> of $L$ Jacobians. Say each layer shrinks the gradient passing through it down to 90% of its size, a totally ordinary amount. After $L=27$ layers, which is SigLIP-So400m's actual depth, you get $0.9^{27}\approx 0.06$: only 6% of the gradient that reached the last layer makes it back to the first. Stack more layers and it decays exponentially toward zero, or explodes instead if each layer amplifies the gradient rather than shrinking it.</p>
      <p>With the residual sum, there is no such product: $\partial L/\partial x_0$ always contains at least $\partial L/\partial x_L$ through the identity term, no matter how degenerate every individual $\partial F_l/\partial x_{l-1}$ gets. That additive identity term is the actual mechanism behind "residual connections fix vanishing gradients."</p>
      <p><strong>Pre-norm puts LayerNorm inside</strong> $F(x)$<strong>.</strong> Because LayerNorm only appears inside the branch, it never touches the raw identity term above, so a healthy, undiminished gradient signal reaches all the way from the last layer back to the first:</p>
      <div class="formula">$$\frac{\partial x_l}{\partial x_{l-1}} = I + \frac{\partial F}{\partial(\operatorname{LN}(x_{l-1}))}\cdot J_{LN}$$</div>
      <p>Here $I$ is a pure, unmodified identity. $J_{LN}$ only multiplies the branch term, it never wraps the whole expression. Unrolled, the skip path is the same clean additive sum as above, with no product of LayerNorm Jacobians ever touching the direct gradient highway.</p>
      <p><strong>Post-norm applies LayerNorm after</strong> $x+F(x)$<strong>, wrapping the whole sum, and this is what reduces gradient flow from the last layer back to the first:</strong></p>
      <div class="formula">$$\frac{\partial x_l}{\partial x_{l-1}} = J_{LN}\cdot\left(I+\frac{\partial F}{\partial x_{l-1}}\right)$$</div>
      <p>The identity term $I$ is now multiplied by $J_{LN}$, no longer a clean pass-through. Unrolled over $L$ layers:</p>
      <div class="formula">$$\frac{\partial L}{\partial x_0} = \frac{\partial L}{\partial x_L}\cdot\prod_l\left[J_{LN,l}\cdot\left(I+\frac{\partial F_l}{\partial x_{l-1}}\right)\right]$$</div>
      <p>The characteristics of the $J_{LN,l}$ element in the above equation in simpler terms is, it carries a $1/\sigma$ rescaling (where $\sigma$ is that layer's per-token standard deviation from its own LayerNorm) and it is not full rank, since it collapses two directions to zero. So it is never exactly the identity.</p>

      <h3 id="but-what-about-activations">But what about activations</h3>
      <p>We saw how pre-norm helps the backward pass through its additive identity-gradient property. But what about the actual $x$ values flowing forward, from the input to the last layer? Since $x_l = x_{l-1} + F_l(\operatorname{LN}(x_{l-1}))$, the main path itself is never normalized: every residual branch only adds more onto it, and nothing on that path ever rescales it back down. So $\|x\|$ keeps growing across a stack of 30 to 60 layers. This is exactly why a final LayerNorm sits at the very end of the main path (SigLIP's <code>post_layernorm</code>): it controls this statistics drift across depth.</p>

      <div class="diagram-wrap">
        <div class="legend">
          <div class="legend-item"><span class="actgrowth-lineswatch" style="background:var(--d-teal-strong)"></span>Pre-norm</div>
          <div class="legend-item"><span class="actgrowth-lineswatch" style="background:var(--d-red)"></span>Post-norm</div>
        </div>
        <figure>
          <svg id="actgrowth-svg" viewBox="0 0 640 340" role="img" aria-label="Interactive line chart comparing activation norm across 20 transformer layers for pre-norm versus post-norm residual stacks, animated layer by layer. Pre-norm's activation norm grows unevenly, some layers adding more than others, from about 1 at layer 0 to about 5.9 by layer 20. Post-norm's activation norm fluctuates around 2.3 across all 20 layers.">
            <line x1="70" y1="20" x2="70" y2="290" class="ghost"/>
            <line x1="70" y1="290" x2="620" y2="290" class="ghost"/>
            <line x1="70" y1="248.5" x2="620" y2="248.5" class="ghost"/>
            <line x1="70" y1="206.9" x2="620" y2="206.9" class="ghost"/>
            <line x1="70" y1="165.4" x2="620" y2="165.4" class="ghost"/>
            <line x1="70" y1="123.8" x2="620" y2="123.8" class="ghost"/>
            <line x1="70" y1="82.3" x2="620" y2="82.3" class="ghost"/>
            <line x1="70" y1="40.8" x2="620" y2="40.8" class="ghost"/>
            <text x="60" y="294" class="sub" text-anchor="end">0</text>
            <text x="60" y="252.5" class="sub" text-anchor="end">1</text>
            <text x="60" y="210.9" class="sub" text-anchor="end">2</text>
            <text x="60" y="169.4" class="sub" text-anchor="end">3</text>
            <text x="60" y="127.8" class="sub" text-anchor="end">4</text>
            <text x="60" y="86.3" class="sub" text-anchor="end">5</text>
            <text x="60" y="44.8" class="sub" text-anchor="end">6</text>
            <text x="70" y="308" class="sub" text-anchor="middle">0</text>
            <text x="207.5" y="308" class="sub" text-anchor="middle">5</text>
            <text x="345.0" y="308" class="sub" text-anchor="middle">10</text>
            <text x="482.5" y="308" class="sub" text-anchor="middle">15</text>
            <text x="620.0" y="308" class="sub" text-anchor="middle">20</text>
            <text x="345" y="330" class="lbl" text-anchor="middle">layer idx</text>
            <text x="24" y="155" class="lbl" text-anchor="middle" transform="rotate(-90 24 155)">&Vert;x&Vert;</text>
            <polyline id="actgrowth-preline" points="70.0,248.5" fill="none" stroke="var(--d-teal-strong)" stroke-width="2.4"/>
            <polyline id="actgrowth-postline" points="70.0,248.5" fill="none" stroke="var(--d-red)" stroke-width="2.2"/>
            <g id="actgrowth-predots"></g>
            <g id="actgrowth-postdots"></g>
          </svg>
          <div class="actgrowth-controls">
            <button type="button" id="actgrowth-replay" class="actgrowth-btn">&#9654;&#xFE0E; Replay</button>
            <input type="range" id="actgrowth-slider" min="0" max="20" step="1" value="0"/>
            <span id="actgrowth-readout" class="sub actgrowth-readout">layer 0, pre-norm &Vert;x&Vert; 1.00, post-norm &Vert;x&Vert; 2.30</span>
          </div>
          <figcaption>Fig. 14. Activation norm growth by layer, pre-norm vs post-norm (illustrative). Drag the slider or hit replay.</figcaption>
        </figure>
      </div>
      <script>
      (function(){
        var pre = [[70.0,248.5,1.00],[97.5,229.8,1.45],[125.0,226.4,1.53],[152.5,211.9,1.88],[180.0,205.7,2.03],[207.5,184.9,2.53],[235.0,183.2,2.57],[262.5,171.6,2.85],[290.0,155.0,3.25],[317.5,150.0,3.37],[345.0,136.7,3.69],[372.5,133.4,3.77],[400.0,114.7,4.22],[427.5,106.4,4.42],[455.0,104.7,4.46],[482.5,89.0,4.84],[510.0,79.0,5.08],[537.5,75.7,5.16],[565.0,58.2,5.58],[592.5,51.6,5.74],[620.0,46.6,5.86]];
        var post = [[70.0,194.5,2.30],[97.5,188.2,2.45],[125.0,200.7,2.15],[152.5,184.1,2.55],[180.0,204.8,2.05],[207.5,182.0,2.60],[235.0,198.6,2.20],[262.5,186.2,2.50],[290.0,202.8,2.10],[317.5,179.9,2.65],[345.0,196.5,2.25],[372.5,190.3,2.40],[400.0,204.8,2.05],[427.5,182.8,2.58],[455.0,199.4,2.18],[482.5,187.0,2.48],[510.0,201.9,2.12],[537.5,181.2,2.62],[565.0,197.8,2.22],[592.5,185.3,2.52],[620.0,200.3,2.16]];
        var svg = document.getElementById('actgrowth-svg');
        if (!svg || svg.dataset.wired) return;
        svg.dataset.wired = '1';
        var preLine = document.getElementById('actgrowth-preline');
        var postLine = document.getElementById('actgrowth-postline');
        var preDotsG = document.getElementById('actgrowth-predots');
        var postDotsG = document.getElementById('actgrowth-postdots');
        var slider = document.getElementById('actgrowth-slider');
        var readout = document.getElementById('actgrowth-readout');
        var replayBtn = document.getElementById('actgrowth-replay');
        var svgNS = 'http://www.w3.org/2000/svg';

        function makeDot(cx, cy, colorVar){
          var c = document.createElementNS(svgNS, 'circle');
          c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', '3.2');
          c.setAttribute('fill', 'var(--d-paper)'); c.setAttribute('stroke', colorVar); c.setAttribute('stroke-width', '1.6');
          return c;
        }
        pre.forEach(function(p){ preDotsG.appendChild(makeDot(p[0], p[1], 'var(--d-teal-strong)')); });
        post.forEach(function(p){ postDotsG.appendChild(makeDot(p[0], p[1], 'var(--d-red)')); });

        var timer = null;

        function render(i){
          preLine.setAttribute('points', pre.slice(0, i+1).map(function(p){ return p[0]+','+p[1]; }).join(' '));
          postLine.setAttribute('points', post.slice(0, i+1).map(function(p){ return p[0]+','+p[1]; }).join(' '));
          Array.prototype.forEach.call(preDotsG.children, function(d, idx){ d.style.display = idx <= i ? '' : 'none'; });
          Array.prototype.forEach.call(postDotsG.children, function(d, idx){ d.style.display = idx <= i ? '' : 'none'; });
          slider.value = i;
          readout.textContent = 'layer ' + i + ', pre-norm ‖x‖ ' + pre[i][2].toFixed(2) + ', post-norm ‖x‖ ' + post[i][2].toFixed(2);
        }

        function stopAutoplay(){ if (timer){ clearInterval(timer); timer = null; } }

        function playFrom(start){
          stopAutoplay();
          var i = start;
          render(i);
          timer = setInterval(function(){
            i++;
            if (i > 20){ stopAutoplay(); return; }
            render(i);
          }, 350);
        }

        slider.addEventListener('pointerdown', stopAutoplay);
        slider.addEventListener('input', function(){ stopAutoplay(); render(parseInt(slider.value, 10)); });
        replayBtn.addEventListener('click', function(){ playFrom(0); });

        render(0);

        if ('IntersectionObserver' in window){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
              if (entry.isIntersecting){ playFrom(0); io.disconnect(); }
            });
          }, { threshold: 0.4 });
          io.observe(svg);
        } else {
          playFrom(0);
        }
      })();
      </script>
      <style>
        .actgrowth-controls{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:8px; font-family:'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; }
        .actgrowth-btn{ font-family:inherit; font-size:12.5px; font-weight:700; color:var(--d-ink); background:var(--d-paper); border:1.5px solid var(--d-teal); border-radius:6px; padding:4px 10px; cursor:pointer; }
        .actgrowth-btn:hover{ background:var(--d-container-bg); }
        #actgrowth-slider{ flex:1 1 160px; min-width:120px; accent-color:var(--d-teal-strong); }
        .actgrowth-readout{ white-space:nowrap; }
        .actgrowth-lineswatch{ display:inline-block; width:18px; height:3px; border-radius:2px; margin-right:4px; vertical-align:middle; }
      </style>
    </section>

    <section>
      <h2 id="multi-modal-projector">Multi-Modal Projector</h2>
      <p>The connector between the two models is a single linear layer. It projects each SigLIP patch embedding (1152-dim) into Gemma's token embedding space (2048-dim) so the resulting image tokens can simply be concatenated with the text tokens and handed to the decoder.</p>

      <div class="diagram-wrap">
        <figure>
          <svg viewBox="0 0 480 316" role="img" aria-label="Multi-modal projector architecture: SigLIP patch embeddings of shape B by 256 by 1152 pass through a single linear layer, nn.Linear from 1152 to 2048 with bias, producing image tokens of shape B by 256 by 2048 handed to the Gemma decoder.">
            <defs>
              <marker id="proj-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
              </marker>
              <filter id="proj-rough" x="-8%" y="-8%" width="116%" height="116%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="11" result="noise"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
              </filter>
            </defs>
            <polygon class="term" points="90,20 390,20 363,90 117,90" filter="url(#proj-rough)"/>
            <text x="240" y="52" class="lbl" text-anchor="middle">SigLIP Patch Embeddings</text>
            <text x="240" y="76" class="sub" text-anchor="middle">[B, 256, 1152]</text>
            <line x1="240" y1="90" x2="240" y2="132" class="arrow" marker-end="url(#proj-arrowhead)"/>
            <rect class="proc" x="90" y="140" width="300" height="64" rx="10" filter="url(#proj-rough)"/>
            <text x="240" y="168" class="lbl" text-anchor="middle">Linear Projection</text>
            <text x="240" y="188" class="sub" text-anchor="middle">nn.Linear(1152 &rarr; 2048, bias=True)</text>
            <line x1="240" y1="204" x2="240" y2="246" class="arrow" marker-end="url(#proj-arrowhead)"/>
            <rect x="181.3" y="215.0" width="117.4" height="22" rx="6" class="shapepill"/><text x="240" y="230.0" class="shapetxt" text-anchor="middle">[B, 256, 2048]</text>
            <polygon class="term" points="140,254 340,254 322,308 158,308" filter="url(#proj-rough)"/>
            <text x="240" y="279" class="lbl" text-anchor="middle">Image Tokens</text>
            <text x="240" y="297" class="sub" text-anchor="middle">&rarr; Gemma Decoder</text>
          </svg>
          <figcaption>Fig. 15. Multi-modal projector: a single linear layer, no MLP.</figcaption>
        </figure>
      </div>
    </section>

    <section>
      <h2 id="gemma-2b">Gemma-2B</h2>
      <p>Gemma is a family of <strong>auto-regressive, decoder-only open large language models</strong> built from the same research and technology used to create the Gemini models. The models come in different sizes (2B, 7B), both pretrained and instruction fine-tuned. PaliGemma uses the 2B pretrained version. Its primary function is to generate text token&#8209;word by token&#8209;word, based on a prompt provided by a user.</p>
      <h3 id="gemma-2b-architecture">Gemma-2B Architecture</h3>

      <div class="diagram-wrap">
        <div class="legend">
          <div class="legend-item"><span class="swatch module"></span>module / op</div>
          <div class="legend-item"><span class="swatch repeat"></span>repeated block (&times; N, stacked)</div>
          <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
          <div class="legend-item"><span class="swatch add"></span>&oplus; residual add</div>
        </div>

        <figure>
<svg viewBox="0 70 780 1995" role="img" aria-label="Diagram of the Gemma-2B decoder used in PaliGemma, showing tensor shapes at each stage: token embedding scaled by root hidden size, 18 stacked pre-norm decoder layers each with RMSNorm, multi-query attention (8 query heads sharing a single key/value head, RoPE applied to Q and K, K/V broadcast to all query heads before the scaled dot-product attention), a residual add, a second RMSNorm, a GeGLU MLP, and a second residual add, followed by a final RMSNorm.">
  <defs>
    <marker id="gm-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
    </marker>
    <filter id="gm-rough" x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="17" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
<polygon class="term" points="238.0,91 522.0,91 540.0,145 220.0,145" filter="url(#gm-rough)"/>
<text x="380" y="115.3" class="lbl" text-anchor="middle">Input Tokens</text>
<text x="380" y="134.2" class="sub" text-anchor="middle">[B, seq_len]</text>
<line x1="380" y1="145" x2="380" y2="185" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="321.4" y="159.0" width="117.2" height="22" rx="6" class="shapepill"/><text x="380" y="174.0" class="shapetxt" text-anchor="middle">[B, seq_len]</text>
<rect class="proc" x="220.0" y="195" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="223.2" class="lbl" text-anchor="middle">Token Embedding</text>
<text x="380.0" y="241.1" class="sub" text-anchor="middle">nn.Embedding(257152, 2048)</text>
<line x1="380" y1="259" x2="380" y2="299" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="273.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="288.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="proc" x="220.0" y="309" width="320" height="50" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="331.0" class="lbl" text-anchor="middle">Embedding Scaling</text>
<text x="380.0" y="345.0" class="sub" text-anchor="middle">hidden_states &times; &radic;2048</text>
<line x1="380" y1="359" x2="380" y2="399" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="373.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="388.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="ghost" x="67" y="382" width="680" height="1520" rx="22" filter="url(#gm-rough)"/>
<rect class="ghost" x="58" y="391" width="680" height="1520" rx="22" filter="url(#gm-rough)"/>
<rect class="ghost" x="49" y="400" width="680" height="1520" rx="22" filter="url(#gm-rough)"/>
<rect class="containerOuter" x="40" y="409" width="680" height="1520" rx="22" filter="url(#gm-rough)"/>
<text x="62" y="439" class="clbl">Gemma Decoder (&times; 18 Gemma Decoder Layer, MQA)</text>
<rect class="proc" x="220.0" y="449" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="477.2" class="lbl" text-anchor="middle">RMSNorm</text>
<text x="380.0" y="495.1" class="sub" text-anchor="middle">input_layernorm, RMSNorm(2048), eps=1e-6</text>
<line x1="380" y1="513" x2="380" y2="553" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="527.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="542.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="ghost" x="98" y="545" width="600" height="652" rx="22" filter="url(#gm-rough)"/>
<rect class="ghost" x="89" y="554" width="600" height="652" rx="22" filter="url(#gm-rough)"/>
<rect class="container" x="80" y="563" width="600" height="652" rx="22" filter="url(#gm-rough)"/>
<text x="102" y="593" class="clbl">Multi-Query Attention (8 query heads &times; 256 dim, 1 shared KV head)</text>
<rect class="proc" x="85.0" y="603" width="170" height="64" rx="10" filter="url(#gm-rough)"/><text x="170.0" y="631.0" class="lbl" text-anchor="middle">q_proj</text><text x="170.0" y="651.0" class="sub" text-anchor="middle">2048&rarr;2048, 8&times;256</text>
<rect class="proc" x="295.0" y="603" width="170" height="64" rx="10" filter="url(#gm-rough)"/><text x="380.0" y="631.0" class="lbl" text-anchor="middle">k_proj</text><text x="380.0" y="651.0" class="sub" text-anchor="middle">2048&rarr;256, 1&times;256</text>
<rect class="proc" x="505.0" y="603" width="170" height="64" rx="10" filter="url(#gm-rough)"/><text x="590.0" y="631.0" class="lbl" text-anchor="middle">v_proj</text><text x="590.0" y="651.0" class="sub" text-anchor="middle">2048&rarr;256, 1&times;256</text>
<line x1="170.0" y1="667" x2="170.0" y2="705" class="arrow" marker-end="url(#gm-arrowhead)"/>
<line x1="380.0" y1="667" x2="380.0" y2="705" class="arrow" marker-end="url(#gm-arrowhead)"/>
<line x1="590.0" y1="667" x2="590.0" y2="705" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="107.1" y="680.3" width="125.8" height="22" rx="6" class="shapepill"/><text x="170.0" y="695.3" class="shapetxt" text-anchor="middle">[B,8,seq,256]</text>
<rect x="317.1" y="680.3" width="125.8" height="22" rx="6" class="shapepill"/><text x="380.0" y="695.3" class="shapetxt" text-anchor="middle">[B,1,seq,256]</text>
<rect x="527.1" y="680.3" width="125.8" height="22" rx="6" class="shapepill"/><text x="590.0" y="695.3" class="shapetxt" text-anchor="middle">[B,1,seq,256]</text>
<rect class="proc" x="85.0" y="713" width="380.0" height="54" rx="10" filter="url(#gm-rough)"/>
<text x="275.0" y="736.8" class="lbl" text-anchor="middle">Apply RoPE</text>
<text x="275.0" y="751.9" class="sub" text-anchor="middle">rotate Q, K by position (V unrotated)</text>
<line x1="380" y1="767" x2="380" y2="803" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="325.7" y="779.6" width="108.6" height="22" rx="6" class="shapepill"/><text x="380" y="794.6" class="shapetxt" text-anchor="middle">Q,K rotated</text>
<line x1="590.0" y1="702.3" x2="430" y2="813" class="arrow" marker-end="url(#gm-arrowhead)"/>
<text x="600.0" y="757.6" class="skiplbl">V unrotated</text>
<rect class="proc" x="220.0" y="813" width="320" height="50" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="835.0" class="lbl" text-anchor="middle">repeat_kv</text>
<text x="380.0" y="849.0" class="sub" text-anchor="middle">broadcast K,V from 1 &rarr; 8 heads (MQA)</text>
<line x1="380" y1="863" x2="380" y2="899" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="317.1" y="875.6" width="125.8" height="22" rx="6" class="shapepill"/><text x="380" y="890.6" class="shapetxt" text-anchor="middle">[B,8,seq,256]</text>
<rect class="proc" x="220.0" y="909" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="937.2" class="lbl" text-anchor="middle">Scaled Dot-Product Attention</text>
<text x="380.0" y="955.1" class="sub" text-anchor="middle">softmax(QK&#7488;/&radic;256)&middot;V</text>
<line x1="380" y1="973" x2="380" y2="1009" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="317.1" y="985.6" width="125.8" height="22" rx="6" class="shapepill"/><text x="380" y="1000.6" class="shapetxt" text-anchor="middle">[B,8,seq,256]</text>
<rect class="proc" x="220.0" y="1019" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="1047.2" class="lbl" text-anchor="middle">Concat heads + reshape</text>
<text x="380.0" y="1065.1" class="sub" text-anchor="middle">(B,8,seq,256) &rarr; (B,seq,2048)</text>
<line x1="380" y1="1083" x2="380" y2="1119" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="1095.6" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="1110.6" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="proc" x="220.0" y="1129" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="1157.2" class="lbl" text-anchor="middle">o_proj</text>
<text x="380.0" y="1175.1" class="sub" text-anchor="middle">Linear 2048&rarr;2048</text>
<line x1="380" y1="1223" x2="380" y2="1263" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="1237.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="1252.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<circle cx="380" cy="1288" r="19" class="addnode" filter="url(#gm-rough)"/><text x="380" y="1295" class="addsym" text-anchor="middle">&oplus;</text>
<path d="M 380 449 C 64 449, 64 1288.0, 361 1288.0" class="skip" filter="url(#gm-rough)" marker-end="url(#gm-arrowhead)"/>
<text x="58" y="891.0" class="skiplbl" text-anchor="middle" transform="rotate(-90 58 891.0)">residual</text>
<line x1="380" y1="1315" x2="380" y2="1355" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="1329.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="1344.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="proc" x="220.0" y="1365" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="1393.2" class="lbl" text-anchor="middle">RMSNorm</text>
<text x="380.0" y="1411.1" class="sub" text-anchor="middle">post_attention_layernorm, RMSNorm(2048)</text>
<line x1="380" y1="1429" x2="380" y2="1469" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="1443.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="1458.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="container" x="80" y="1479" width="600" height="332" rx="22" filter="url(#gm-rough)"/>
<text x="102" y="1509" class="clbl">Gemma MLP (GeGLU)</text>
<rect class="proc" x="110.0" y="1519" width="260" height="64" rx="10" filter="url(#gm-rough)"/><text x="240.0" y="1547.0" class="lbl" text-anchor="middle">gate_proj</text><text x="240.0" y="1567.0" class="sub" text-anchor="middle">Linear 2048&rarr;16384</text>
<rect class="proc" x="410.0" y="1519" width="260" height="64" rx="10" filter="url(#gm-rough)"/><text x="540.0" y="1547.0" class="lbl" text-anchor="middle">up_proj</text><text x="540.0" y="1567.0" class="sub" text-anchor="middle">Linear 2048&rarr;16384</text>
<line x1="240.0" y1="1583" x2="380" y2="1621" class="arrow" marker-end="url(#gm-arrowhead)"/>
<line x1="540.0" y1="1583" x2="380" y2="1621" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="177.1" y="1596.3" width="125.8" height="22" rx="6" class="shapepill"/><text x="240.0" y="1611.3" class="shapetxt" text-anchor="middle">[B,seq,16384]</text>
<rect x="477.1" y="1596.3" width="125.8" height="22" rx="6" class="shapepill"/><text x="540.0" y="1611.3" class="shapetxt" text-anchor="middle">[B,seq,16384]</text>
<rect class="proc" x="220.0" y="1629" width="320" height="50" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="1651.0" class="lbl" text-anchor="middle">GELU(gate) &times; up</text>
<text x="380.0" y="1665.0" class="sub" text-anchor="middle">GeGLU element-wise gate</text>
<line x1="380" y1="1679" x2="380" y2="1715" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="291.3" y="1691.6" width="177.4" height="22" rx="6" class="shapepill"/><text x="380" y="1706.6" class="shapetxt" text-anchor="middle">[B, seq_len, 16384]</text>
<rect class="proc" x="220.0" y="1725" width="320" height="64" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="1753.2" class="lbl" text-anchor="middle">down_proj</text>
<text x="380.0" y="1771.1" class="sub" text-anchor="middle">Linear 16384&rarr;2048</text>
<line x1="380" y1="1819" x2="380" y2="1859" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="1833.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="1848.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<circle cx="380" cy="1884" r="19" class="addnode" filter="url(#gm-rough)"/><text x="380" y="1891" class="addsym" text-anchor="middle">&oplus;</text>
<path d="M 380 1365 C 64 1365, 64 1884.0, 361 1884.0" class="skip" filter="url(#gm-rough)" marker-end="url(#gm-arrowhead)"/>
<text x="58" y="1647.0" class="skiplbl" text-anchor="middle" transform="rotate(-90 58 1647.0)">residual</text>
<line x1="380" y1="1911" x2="380" y2="1945" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="1935.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="1950.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
<rect class="proc" x="220.0" y="1955" width="320" height="50" rx="10" filter="url(#gm-rough)"/>
<text x="380.0" y="1977.0" class="lbl" text-anchor="middle">Final RMSNorm</text>
<text x="380.0" y="1991.0" class="sub" text-anchor="middle">norm, RMSNorm(2048), eps=1e-6</text>
<line x1="380" y1="2005" x2="380" y2="2045" class="arrow" marker-end="url(#gm-arrowhead)"/>
<rect x="295.6" y="2019.0" width="168.8" height="22" rx="6" class="shapepill"/><text x="380" y="2034.0" class="shapetxt" text-anchor="middle">[B, seq_len, 2048]</text>
</svg>
          <figcaption>
            Fig. 16. Gemma-2B decoder architecture (MQA).
          </figcaption>
        </figure>
      </div>
    </section>

    <section>
      <h2 id="attention-is-all-you-need">Attention Is All You Need</h2>
      <h3 id="self-attention">Self Attention</h3>
      <p>Here's the situation. You have a sequence of token embeddings, each a vector in <span style="white-space:nowrap">$\mathbb{R}^{d_{\text{model}}}$</span>. Each token knows something about itself, but nothing about the tokens around it. The word <em>bank</em> doesn't yet know whether it's followed by <em>account</em> or <em>river</em>.</p>
      <p><strong>Self-attention</strong> is the mechanism that lets tokens talk to each other. It's how <em>bank</em> figures out which other tokens in the sequence are relevant to it, and then gathers information from them. This was introduced in the <strong>Attention Is All You Need</strong> paper in 2017 by Vaswani et al. and has been the essential unchanged component in each LLM architecture over the years.</p>
      <p>So how does a token decide what's relevant, and how does it gather information from relevant tokens once it has? That's what <strong>Q, K, and V</strong> are for.</p>
      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/paligemma-3b/self-attention-demo.gif" alt="Animated demo of self-attention over the sentence 'the cat sat on the mat': as the query token cycles through each word, arcs of varying thickness connect it to every other token, labeled with the attention weight each one receives, and a small bar chart shows the resulting weighted-sum output vector updating to match.">
        </div>
        <figcaption class="figure-caption">Fig. 17. Source: <a href="https://thegustafson.com/blog/attention-from-scratch" target="_blank" rel="noopener">thegustafson.com/blog/attention-from-scratch</a>.</figcaption>
      </figure>
      <p>The step-by-step mathematical and logical pipeline of self-attention relies on three distinct vectors calculated for each token:</p>
      <ul>
        <li><strong>Queries (Q):</strong> what a token is currently looking for in other tokens, the questions it asks of them.</li>
        <li><strong>Keys (K):</strong> what kind of information a token holds, what it imparts to others.</li>
        <li><strong>Values (V):</strong> how much weight should be given, how much information should be carried forward.</li>
      </ul>
      <p>In simpler words: when a new token comes in, it <strong>"queries" against the existing tokens' "keys" </strong>in the context; the resulting dot-product, a similarity or <strong>attention score</strong>, is then weighted by each token's <strong>"value"</strong> vector to decide what's more important. The <strong>softmax function</strong> turns these raw scores into a row-wise probability distribution. Put simply, <strong>each token's output is just a weighted blend of every value vector in the sequence</strong>.</p>
      <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 3.</p>
      <div class="formula">$$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$</div>
      <p>Here $d_k$ represents number of embedding dimensions for each token.</p> <p><strong>Need for $\sqrt{d_k}$?</strong> Dot products are sums: <strong> $q \cdot k = \sum_{i=1}^{d_k} q_i k_i$ </strong>, one term per dimension. So a dot product is a sum over $d_k$ terms, and the more terms you add up,<strong> the larger that sum </strong> tends to get in magnitude (assuming each component is on a similar scale).<br>
Left unchecked, this pushes the raw scores to <strong> grow with $d_k$ </strong>, and softmax reacts badly to that: it exponentiates each score before normalizing, so even a modest gap between the top score and the rest gets stretched into a much larger gap after exponentiating, and <strong>the top token's share balloons toward 1 while everyone else's shrinks toward 0</strong>. <strong>Dividing by $\sqrt{d_k}$ normalizes the variance back to approx. 1</strong>, which keeps the scores in a range where softmax can actually spread attention across multiple tokens instead of collapsing to one.</p>
      <div class="diagram-wrap">
        <div class="legend">
          <div class="legend-item"><span class="swatch module"></span>module / op</div>
          <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
        </div>
        <figure>
<svg viewBox="0 0 900 850" role="img" aria-label="Single-head self-attention with concrete numbers: a batch of B input sequences of 3 tokens each, shape B by 3 by 512, is passed through three independent linear layers (each weight matrix shaped 512 by 512) to produce Q, K, and V, each shape B by 3 by 512 (single-head attention has no dimension reduction). Q and K are multiplied to form a B by 3 by 3 score matrix, scaled by 1 over the square root of 512, and passed through a row-wise softmax to produce attention weights, also B by 3 by 3. Those weights are multiplied with V to produce the attention output, shape B by 3 by 512.">
<defs>
  <marker id="qkv-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="qkv-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="7" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="300,20 600,20 614,76 286,76" filter="url(#qkv-rough)"/>
<text x="450" y="45" class="lbl" text-anchor="middle">Input Tokens</text>
<text x="450" y="63" class="sub" text-anchor="middle">x_1, x_2, x_3: (B, 3, 512)</text>
<line x1="450" y1="76" x2="450" y2="110" class="arrow"/>
<line x1="450" y1="110" x2="150" y2="152" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<line x1="450" y1="110" x2="450" y2="152" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<line x1="450" y1="110" x2="750" y2="152" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect class="proc" x="60" y="152" width="180" height="56" rx="10" filter="url(#qkv-rough)"/>
<text x="150" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="150" y="198" class="sub" text-anchor="middle">W_Q: (512, 512)</text>
<rect class="proc" x="360" y="152" width="180" height="56" rx="10" filter="url(#qkv-rough)"/>
<text x="450" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="450" y="198" class="sub" text-anchor="middle">W_K: (512, 512)</text>
<rect class="proc" x="660" y="152" width="180" height="56" rx="10" filter="url(#qkv-rough)"/>
<text x="750" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="750" y="198" class="sub" text-anchor="middle">W_V: (512, 512)</text>
<line x1="150" y1="208" x2="150" y2="264" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<line x1="450" y1="208" x2="450" y2="264" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<line x1="750" y1="208" x2="750" y2="264" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect x="90" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="150" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect x="390" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect x="690" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="750" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<polygon class="term" points="80,264 220,264 230,314 70,314" filter="url(#qkv-rough)"/>
<text x="150" y="290" class="lbl" text-anchor="middle">Q</text>
<text x="150" y="306" class="sub" text-anchor="middle">queries</text>
<polygon class="term" points="380,264 520,264 530,314 370,314" filter="url(#qkv-rough)"/>
<text x="450" y="290" class="lbl" text-anchor="middle">K</text>
<text x="450" y="306" class="sub" text-anchor="middle">keys</text>
<polygon class="term" points="680,264 820,264 830,314 670,314" filter="url(#qkv-rough)"/>
<text x="750" y="290" class="lbl" text-anchor="middle">V</text>
<text x="750" y="306" class="sub" text-anchor="middle">values</text>
<path d="M 150 314 C 150 340, 240 348, 285 374" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<path d="M 450 314 C 450 340, 360 348, 315 374" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect class="proc" x="190" y="374" width="220" height="56" rx="10" filter="url(#qkv-rough)"/>
<text x="300" y="402" class="lbl" text-anchor="middle">MatMul: Q &middot; K&#7488;</text>
<text x="300" y="420" class="sub" text-anchor="middle">attention scores</text>
<line x1="300" y1="430" x2="300" y2="486" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect x="255" y="447" width="90" height="22" rx="6" class="shapepill"/>
<text x="300" y="462" class="shapetxt" text-anchor="middle">(B, 3, 3)</text>
<rect class="proc" x="160" y="486" width="280" height="56" rx="10" filter="url(#qkv-rough)"/>
<text x="300" y="514" class="lbl" text-anchor="middle">Scale + Softmax</text>
<text x="300" y="532" class="sub" text-anchor="middle">softmax(Q K&#7488; / &radic;512), row-wise</text>
<line x1="300" y1="542" x2="300" y2="598" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect x="255" y="559" width="90" height="22" rx="6" class="shapepill"/>
<text x="300" y="574" class="shapetxt" text-anchor="middle">(B, 3, 3)</text>
<text x="360" y="575" class="skiplbl" text-anchor="start">attention weights, rows sum to 1</text>
<line x1="750" y1="314" x2="750" y2="606" class="arrow"/>
<path d="M 300 598 C 300 624, 370 644, 405 658" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<path d="M 750 606 C 750 628, 690 644, 655 658" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect class="proc" x="380" y="658" width="280" height="56" rx="10" filter="url(#qkv-rough)"/>
<text x="520" y="686" class="lbl" text-anchor="middle">MatMul: weights &middot; V</text>
<text x="520" y="704" class="sub" text-anchor="middle">output = &sum;_j A_ij v_j</text>
<line x1="520" y1="714" x2="520" y2="770" class="arrow" marker-end="url(#qkv-arrowhead)"/>
<rect x="460" y="731" width="120" height="22" rx="6" class="shapepill"/>
<text x="520" y="746" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<polygon class="term" points="350,770 690,770 704,826 336,826" filter="url(#qkv-rough)"/>
<text x="520" y="798" class="lbl" text-anchor="middle">Attention(Q, K, V)</text>
<text x="520" y="816" class="sub" text-anchor="middle">(B, 3, 512): one output vector per input token</text>
</svg>
          <figcaption>
            Fig. 18. Self-attention block architecture.
          </figcaption>
        </figure>
      </div>

      <p style="margin-top: 1.2rem;">This is how few lines are required to code a Self-Attention block:</p>
      <details class="collapsible" style="margin-top: .5rem;"><summary><code>single_head_attention.py</code></summary><pre class="formula highlight"><code><span class="k">class</span> <span class="nc">SingleHeadAttention</span><span class="p">(</span><span class="n">nn</span><span class="p">.</span><span class="n">Module</span><span class="p">):</span>
      <span class="k">def</span> <span class="nf">__init__</span><span class="p">(</span><span class="n">self</span><span class="p">,</span> <span class="n">d_model</span><span class="p">:</span> <span class="nb">int</span><span class="p">,</span> <span class="n">d_k</span><span class="p">:</span> <span class="nb">int</span><span class="p">):</span>
            <span class="nf">super</span><span class="p">().</span><span class="nf">__init__</span><span class="p">()</span>
            <span class="n">self</span><span class="p">.</span><span class="n">d_k</span> <span class="o">=</span> <span class="n">d_k</span>
            <span class="c1"># PARAMETERS (learned); each weight: (d_k, d_model)
</span>            <span class="n">self</span><span class="p">.</span><span class="n">W_Q</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_k</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>
            <span class="n">self</span><span class="p">.</span><span class="n">W_K</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_k</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>
            <span class="n">self</span><span class="p">.</span><span class="n">W_V</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_k</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>

      <span class="k">def</span> <span class="nf">forward</span><span class="p">(</span><span class="n">self</span><span class="p">,</span> <span class="n">x</span><span class="p">:</span> <span class="n">torch</span><span class="p">.</span><span class="n">Tensor</span><span class="p">)</span> <span class="o">-&gt;</span> <span class="n">torch</span><span class="p">.</span><span class="n">Tensor</span><span class="p">:</span>
            <span class="c1"># x: (B, n, d_model)
</span>
            <span class="c1"># ACTIVATIONS -- different for every input
</span>            <span class="n">Q</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_Q</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>  <span class="c1"># (B, n, d_k)
</span>            <span class="n">K</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_K</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>  <span class="c1"># (B, n, d_k)
</span>            <span class="n">V</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_V</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>  <span class="c1"># (B, n, d_k)
</span>
            <span class="n">scores</span> <span class="o">=</span> <span class="n">Q</span> <span class="o">@</span> <span class="n">K</span><span class="p">.</span><span class="nf">transpose</span><span class="p">(</span><span class="o">-</span><span class="mi">2</span><span class="p">,</span> <span class="o">-</span><span class="mi">1</span><span class="p">)</span>      <span class="c1"># (B, n, n)
</span>            <span class="n">scores</span> <span class="o">=</span> <span class="n">scores</span> <span class="o">/</span> <span class="n">self</span><span class="p">.</span><span class="n">d_k</span> <span class="o">**</span> <span class="mf">0.5</span>
            <span class="n">weights</span> <span class="o">=</span> <span class="n">scores</span><span class="p">.</span><span class="nf">softmax</span><span class="p">(</span><span class="n">dim</span><span class="o">=-</span><span class="mi">1</span><span class="p">)</span>      <span class="c1"># (B, n, n), rows sum to 1
</span>            <span class="n">output</span> <span class="o">=</span> <span class="n">weights</span> <span class="o">@</span> <span class="n">V</span>                  <span class="c1"># (B, n, d_k)
</span>            <span class="k">return</span> <span class="n">output</span>

<span class="c1"># B sequences, n = 3 tokens, d_model = 512, single head so d_k = d_model
</span><span class="n">attn</span> <span class="o">=</span> <span class="nc">SingleHeadAttention</span><span class="p">(</span><span class="n">d_model</span><span class="o">=</span><span class="mi">512</span><span class="p">,</span> <span class="n">d_k</span><span class="o">=</span><span class="mi">512</span><span class="p">)</span>
<span class="n">x</span> <span class="o">=</span> <span class="n">torch</span><span class="p">.</span><span class="nf">randn</span><span class="p">(</span><span class="n">B</span><span class="p">,</span> <span class="mi">3</span><span class="p">,</span> <span class="mi">512</span><span class="p">)</span>                         <span class="c1"># (B, 3, 512)
</span><span class="n">output</span> <span class="o">=</span> <span class="nf">attn</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>                                   <span class="c1"># (B, 3, 512)</span></code></pre></details>
      <p>Attention scores are often used as a window for <strong>explainability</strong>, since they show exactly which tokens a model leaned on to produce each output.<br> 
Take the sentence <strong>"My name is pranav"</strong>: row-wise softmax turns each row of raw scores into a probability distribution over the keys, so every row below sums to 1, and each cell's shade encodes how much attention that query paid to that key:</p>

      <div class="diagram-wrap">
        <figure>
<svg viewBox="0 0 484 464" style="width:60%;min-width:0;max-width:100%;margin:0 auto;" role="img">
<text x="284.0" y="24" class="lbl" text-anchor="middle">key</text>
<text x="24" y="268.0" class="lbl" text-anchor="middle" transform="rotate(-90 24 268.0)">query</text>
<text x="152.0" y="78" class="sub" text-anchor="middle">My</text>
<text x="240.0" y="78" class="sub" text-anchor="middle">name</text>
<text x="328.0" y="78" class="sub" text-anchor="middle">is</text>
<text x="416.0" y="78" class="sub" text-anchor="middle">pranav</text>
<text x="94" y="141.0" class="sub" text-anchor="end">My</text>
<rect x="108" y="92" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.60" stroke="var(--d-rule)" stroke-width="1"/>
<text x="152.0" y="142.0" class="heat-light" text-anchor="middle">0.60</text>
<rect x="196" y="92" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.30" stroke="var(--d-rule)" stroke-width="1"/>
<text x="240.0" y="142.0" class="heat-dark" text-anchor="middle">0.30</text>
<rect x="284" y="92" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.05" stroke="var(--d-rule)" stroke-width="1"/>
<text x="328.0" y="142.0" class="heat-dark" text-anchor="middle">0.05</text>
<rect x="372" y="92" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.05" stroke="var(--d-rule)" stroke-width="1"/>
<text x="416.0" y="142.0" class="heat-dark" text-anchor="middle">0.05</text>
<text x="94" y="229.0" class="sub" text-anchor="end">name</text>
<rect x="108" y="180" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.15" stroke="var(--d-rule)" stroke-width="1"/>
<text x="152.0" y="230.0" class="heat-dark" text-anchor="middle">0.15</text>
<rect x="196" y="180" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.35" stroke="var(--d-rule)" stroke-width="1"/>
<text x="240.0" y="230.0" class="heat-dark" text-anchor="middle">0.35</text>
<rect x="284" y="180" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.10" stroke="var(--d-rule)" stroke-width="1"/>
<text x="328.0" y="230.0" class="heat-dark" text-anchor="middle">0.10</text>
<rect x="372" y="180" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.40" stroke="var(--d-rule)" stroke-width="1"/>
<text x="416.0" y="230.0" class="heat-light" text-anchor="middle">0.40</text>
<text x="94" y="317.0" class="sub" text-anchor="end">is</text>
<rect x="108" y="268" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.05" stroke="var(--d-rule)" stroke-width="1"/>
<text x="152.0" y="318.0" class="heat-dark" text-anchor="middle">0.05</text>
<rect x="196" y="268" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.35" stroke="var(--d-rule)" stroke-width="1"/>
<text x="240.0" y="318.0" class="heat-dark" text-anchor="middle">0.35</text>
<rect x="284" y="268" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.20" stroke="var(--d-rule)" stroke-width="1"/>
<text x="328.0" y="318.0" class="heat-dark" text-anchor="middle">0.20</text>
<rect x="372" y="268" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.40" stroke="var(--d-rule)" stroke-width="1"/>
<text x="416.0" y="318.0" class="heat-light" text-anchor="middle">0.40</text>
<text x="94" y="405.0" class="sub" text-anchor="end">pranav</text>
<rect x="108" y="356" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.10" stroke="var(--d-rule)" stroke-width="1"/>
<text x="152.0" y="406.0" class="heat-dark" text-anchor="middle">0.10</text>
<rect x="196" y="356" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.55" stroke="var(--d-rule)" stroke-width="1"/>
<text x="240.0" y="406.0" class="heat-light" text-anchor="middle">0.55</text>
<rect x="284" y="356" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.05" stroke="var(--d-rule)" stroke-width="1"/>
<text x="328.0" y="406.0" class="heat-dark" text-anchor="middle">0.05</text>
<rect x="372" y="356" width="88" height="88" fill="var(--d-teal-strong)" fill-opacity="0.30" stroke="var(--d-rule)" stroke-width="1"/>
<text x="416.0" y="406.0" class="heat-dark" text-anchor="middle">0.30</text>
</svg>
          <figcaption>Fig. 19. Reading the bottom row: token <code>pranav</code> puts <strong>55%</strong> of its attention back on <code>name</code>, more than double what it gives itself, while <code>name</code> and <code>is</code> each send <strong>40%</strong> of their attention forward onto <code>pranav</code>. </figcaption>
        </figure>
      </div>

      <h3 id="mha">Expanding with Multi-Head Attention (MHA)</h3>
      <p>The intuition behind multi-head attention is that by applying the attention mechanism multiple times in parallel within its embedding space, the model can capture different types of relationships in the data.</p>
      <p>MHA <strong>splits the embedding dimension into n_heads</strong>, each with d_model//n_heads dimension. Each of these heads has its own Q,K,V linear layers and perform their scaled dot-product attention independently. Each head attends to the sequence differently, letting the model capture several types of relationships at once instead of just one. A final projection linear layer W_O is required to project back the concatenated output of the heads to same shape as input.</p>
      <div class="diagram-wrap">
        <div class="legend">
          <div class="legend-item"><span class="swatch module"></span>module / op</div>
          <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
        </div>
        <figure>
<svg viewBox="0 0 900 780" role="img" aria-label="Multi-head attention with concrete numbers: a batch of B input sequences of 3 tokens each, shape B by 3 by 512, is passed through three independent 512 by 512 linear layers to produce Q, K, and V. Each of Q, K, and V is reshaped into 4 heads of 128 dimensions each. Scaled dot-product attention runs 4 times, once per head, with every head using its own private slice of Q, K, and V -- no sharing across heads. The 4 head outputs, each shape B by 3 by 128, are concatenated back to B by 3 by 512 and passed through an output linear layer to produce the multi-head attention output, shape B by 3 by 512.">
<defs>
  <marker id="mha-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="mha-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="19" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="300,20 600,20 614,76 286,76" filter="url(#mha-rough)"/>
<text x="450" y="45" class="lbl" text-anchor="middle">Input Tokens</text>
<text x="450" y="63" class="sub" text-anchor="middle">(B, 3, 512)</text>
<line x1="450" y1="76" x2="450" y2="110" class="arrow"/>
<line x1="450" y1="110" x2="150" y2="152" class="arrow" marker-end="url(#mha-arrowhead)"/>
<line x1="450" y1="110" x2="450" y2="152" class="arrow" marker-end="url(#mha-arrowhead)"/>
<line x1="450" y1="110" x2="750" y2="152" class="arrow" marker-end="url(#mha-arrowhead)"/>
<rect class="proc" x="60" y="152" width="180" height="56" rx="10" filter="url(#mha-rough)"/>
<text x="150" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="150" y="198" class="sub" text-anchor="middle">W_Q: (512, 512)</text>
<rect class="proc" x="360" y="152" width="180" height="56" rx="10" filter="url(#mha-rough)"/>
<text x="450" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="450" y="198" class="sub" text-anchor="middle">W_K: (512, 512)</text>
<rect class="proc" x="660" y="152" width="180" height="56" rx="10" filter="url(#mha-rough)"/>
<text x="750" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="750" y="198" class="sub" text-anchor="middle">W_V: (512, 512)</text>
<line x1="150" y1="208" x2="150" y2="264" class="arrow" marker-end="url(#mha-arrowhead)"/>
<line x1="450" y1="208" x2="450" y2="264" class="arrow" marker-end="url(#mha-arrowhead)"/>
<line x1="750" y1="208" x2="750" y2="264" class="arrow" marker-end="url(#mha-arrowhead)"/>
<rect x="90" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="150" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect x="390" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect x="690" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="750" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<polygon class="term" points="80,264 220,264 230,314 70,314" filter="url(#mha-rough)"/>
<text x="150" y="288" class="lbl" text-anchor="middle">Q</text>
<text x="150" y="304" class="sub" text-anchor="middle">reshape, 4 &times; 128</text>
<polygon class="term" points="380,264 520,264 530,314 370,314" filter="url(#mha-rough)"/>
<text x="450" y="288" class="lbl" text-anchor="middle">K</text>
<text x="450" y="304" class="sub" text-anchor="middle">reshape, 4 &times; 128</text>
<polygon class="term" points="680,264 820,264 830,314 670,314" filter="url(#mha-rough)"/>
<text x="750" y="288" class="lbl" text-anchor="middle">V</text>
<text x="750" y="304" class="sub" text-anchor="middle">reshape, 4 &times; 128</text>
<path d="M 150 314 C 150 344, 260 358, 330 380" class="arrow" marker-end="url(#mha-arrowhead)"/>
<line x1="450" y1="314" x2="450" y2="380" class="arrow" marker-end="url(#mha-arrowhead)"/>
<path d="M 750 314 C 750 344, 640 358, 570 380" class="arrow" marker-end="url(#mha-arrowhead)"/>
<rect class="proc" x="190" y="380" width="520" height="74" rx="10" filter="url(#mha-rough)"/>
<text x="450" y="408" class="lbl" text-anchor="middle">Scaled Dot-Product Attention &times; 4</text>
<text x="450" y="426" class="sub" text-anchor="middle">each head uses its own Q, K, V slice</text>
<text x="450" y="442" class="sub" text-anchor="middle">(no sharing across heads)</text>
<line x1="450" y1="454" x2="450" y2="500" class="arrow" marker-end="url(#mha-arrowhead)"/>
<rect x="380" y="463" width="140" height="22" rx="6" class="shapepill"/>
<text x="450" y="478" class="shapetxt" text-anchor="middle">(B, 4, 3, 128)</text>
<rect class="proc" x="350" y="500" width="200" height="50" rx="10" filter="url(#mha-rough)"/>
<text x="450" y="524" class="lbl" text-anchor="middle">Concat Heads</text>
<text x="450" y="542" class="sub" text-anchor="middle">&rarr; (B, 3, 512)</text>
<line x1="450" y1="550" x2="450" y2="596" class="arrow" marker-end="url(#mha-arrowhead)"/>
<rect x="390" y="559" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="574" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect class="proc" x="350" y="596" width="200" height="56" rx="10" filter="url(#mha-rough)"/>
<text x="450" y="624" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="450" y="642" class="sub" text-anchor="middle">W_O: (512, 512)</text>
<line x1="450" y1="652" x2="450" y2="698" class="arrow" marker-end="url(#mha-arrowhead)"/>
<rect x="390" y="661" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="676" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<polygon class="term" points="300,698 600,698 614,754 286,754" filter="url(#mha-rough)"/>
<text x="450" y="722" class="lbl" text-anchor="middle">MHA Output</text>
<text x="450" y="738" class="sub" text-anchor="middle">(B, 3, 512)</text>
</svg>
          <figcaption>Fig. 20. Multi-Head Attention (MHA) architecture.</figcaption>
        </figure>
      </div>

      <details class="collapsible" style="margin-bottom: 0;"><summary><code>multi_head_attention.py</code></summary><pre class="formula highlight"><code><span class="k">class</span> <span class="nc">MultiHeadAttention</span><span class="p">(</span><span class="n">nn</span><span class="p">.</span><span class="n">Module</span><span class="p">):</span>
      <span class="k">def</span> <span class="nf">__init__</span><span class="p">(</span><span class="n">self</span><span class="p">,</span> <span class="n">d_model</span><span class="p">:</span> <span class="nb">int</span><span class="p">,</span> <span class="n">num_heads</span><span class="p">:</span> <span class="nb">int</span><span class="p">):</span>
            <span class="nf">super</span><span class="p">().</span><span class="nf">__init__</span><span class="p">()</span>
            <span class="k">assert</span> <span class="n">d_model</span> <span class="o">%</span> <span class="n">num_heads</span> <span class="o">==</span> <span class="mi">0</span>
            <span class="n">self</span><span class="p">.</span><span class="n">d_model</span> <span class="o">=</span> <span class="n">d_model</span>
            <span class="n">self</span><span class="p">.</span><span class="n">h</span> <span class="o">=</span> <span class="n">num_heads</span>
            <span class="n">self</span><span class="p">.</span><span class="n">d_k</span> <span class="o">=</span> <span class="n">d_model</span> <span class="o">//</span> <span class="n">self</span><span class="p">.</span><span class="n">h</span>

            <span class="c1"># one projection for all heads; each weight: (512, 512)
</span>            <span class="n">self</span><span class="p">.</span><span class="n">W_Q</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_model</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>
            <span class="n">self</span><span class="p">.</span><span class="n">W_K</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_model</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>
            <span class="n">self</span><span class="p">.</span><span class="n">W_V</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_model</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>
            <span class="n">self</span><span class="p">.</span><span class="n">W_O</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Linear</span><span class="p">(</span><span class="n">d_model</span><span class="p">,</span> <span class="n">d_model</span><span class="p">,</span> <span class="n">bias</span><span class="o">=</span><span class="bp">False</span><span class="p">)</span>

      <span class="k">def</span> <span class="nf">forward</span><span class="p">(</span><span class="n">self</span><span class="p">,</span> <span class="n">x</span><span class="p">:</span> <span class="n">torch</span><span class="p">.</span><span class="n">Tensor</span><span class="p">)</span> <span class="o">-&gt;</span> <span class="n">torch</span><span class="p">.</span><span class="n">Tensor</span><span class="p">:</span>
            <span class="n">B</span><span class="p">,</span> <span class="n">n</span><span class="p">,</span> <span class="n">_</span> <span class="o">=</span> <span class="n">x</span><span class="p">.</span><span class="n">shape</span>   <span class="c1"># (B, 3, 512)
</span>
            <span class="n">Q</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_Q</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>     <span class="c1"># (B, n, d_model) -&gt; (B, n, d_model)
</span>            <span class="n">K</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_K</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>
            <span class="n">V</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_V</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>

            <span class="c1"># split into heads: (B, n, d_model) -&gt; (B, h, n, d_k)
</span>            <span class="n">Q</span> <span class="o">=</span> <span class="n">Q</span><span class="p">.</span><span class="nf">view</span><span class="p">(</span><span class="n">B</span><span class="p">,</span> <span class="n">n</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">h</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">d_k</span><span class="p">).</span><span class="nf">transpose</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">)</span>
            <span class="n">K</span> <span class="o">=</span> <span class="n">K</span><span class="p">.</span><span class="nf">view</span><span class="p">(</span><span class="n">B</span><span class="p">,</span> <span class="n">n</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">h</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">d_k</span><span class="p">).</span><span class="nf">transpose</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">)</span>
            <span class="n">V</span> <span class="o">=</span> <span class="n">V</span><span class="p">.</span><span class="nf">view</span><span class="p">(</span><span class="n">B</span><span class="p">,</span> <span class="n">n</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">h</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">d_k</span><span class="p">).</span><span class="nf">transpose</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">)</span>

            <span class="c1"># scaled dot-product attention, all heads at once
</span>            <span class="c1"># (B, h, n, d_k) @ (B, h, d_k, n) -&gt; (B, h, n, n)
</span>            <span class="n">scores</span> <span class="o">=</span> <span class="p">(</span><span class="n">Q</span> <span class="o">@</span> <span class="n">K</span><span class="p">.</span><span class="nf">transpose</span><span class="p">(</span><span class="o">-</span><span class="mi">2</span><span class="p">,</span> <span class="o">-</span><span class="mi">1</span><span class="p">))</span> <span class="o">/</span> <span class="n">self</span><span class="p">.</span><span class="n">d_k</span> <span class="o">**</span> <span class="mf">0.5</span>
            <span class="n">weights</span> <span class="o">=</span> <span class="n">scores</span><span class="p">.</span><span class="nf">softmax</span><span class="p">(</span><span class="n">dim</span><span class="o">=-</span><span class="mi">1</span><span class="p">)</span>

            <span class="c1"># (B, h, n, n) @ (B, h, n, d_k) -&gt; (B, h, n, d_k)
</span>            <span class="n">out</span> <span class="o">=</span> <span class="n">weights</span> <span class="o">@</span> <span class="n">V</span>

            <span class="c1"># concat heads: (B, h, n, d_k) -&gt; (B, n, d_model)
</span>            <span class="n">out</span> <span class="o">=</span> <span class="n">out</span><span class="p">.</span><span class="nf">transpose</span><span class="p">(</span><span class="mi">1</span><span class="p">,</span> <span class="mi">2</span><span class="p">).</span><span class="nf">contiguous</span><span class="p">().</span><span class="nf">view</span><span class="p">(</span><span class="n">B</span><span class="p">,</span> <span class="n">n</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">d_model</span><span class="p">)</span>

            <span class="k">return</span> <span class="n">self</span><span class="p">.</span><span class="nc">W_O</span><span class="p">(</span><span class="n">out</span><span class="p">)</span>   <span class="c1"># (B, n, d_model)
</span>
<span class="c1"># B sequences, n = 3 tokens, d_model = 512, h = 4 heads
</span><span class="n">mha</span> <span class="o">=</span> <span class="nc">MultiHeadAttention</span><span class="p">(</span><span class="n">d_model</span><span class="o">=</span><span class="mi">512</span><span class="p">,</span> <span class="n">num_heads</span><span class="o">=</span><span class="mi">4</span><span class="p">)</span>
<span class="n">x</span> <span class="o">=</span> <span class="n">torch</span><span class="p">.</span><span class="nf">randn</span><span class="p">(</span><span class="n">B</span><span class="p">,</span> <span class="mi">3</span><span class="p">,</span> <span class="mi">512</span><span class="p">)</span>   <span class="c1"># (B, 3, 512)
</span><span class="n">output</span> <span class="o">=</span> <span class="nf">mha</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>              <span class="c1"># (B, 3, 512)</span></code></pre></details>

      <h3 id="mqa-emergence">Emergence of Multi-Query Attention (MQA)</h3>
        <p>MQA was brought into existence by <strong>Noam shazeer</strong> with "Fast Transformer Decoding: One Write-Head is All You Need" paper in 2019, which keeps multiple query heads but collapses K and V down to a <strong>single, shared key and value head</strong>, significantly reducing the memory load and speeding up inference.<br>
        Surprisingly the paper demonstrated that accuracy drop was <strong>minimal</strong> while the efficiency gains were huge. While naive pytorch implementation of MQA repeats the K and V heads to attend with multiple heads of Q but in reality all LLM engines efficiently handle this in cuda kernels thus saving memory bandwidth. MQA came as a saviour for the AI world which heavily relied on KV cache.</p>
      <div class="diagram-wrap">
        <div class="legend">
          <div class="legend-item"><span class="swatch module"></span>module / op</div>
          <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
        </div>
        <figure>
<svg viewBox="0 0 900 780" role="img" aria-label="Multi-query attention with concrete numbers: a batch of B input sequences of 3 tokens each, shape B by 3 by 512, is passed through a query linear layer that keeps the full 512 by 512 weight and a key and a value linear layer that each have a 128 by 512 weight, one shared head width, instead of 4 separate 128-wide heads. Q is reshaped into 4 heads of 128, while K and V stay as a single B by 3 by 128 tensor each, reused by every query head. Scaled dot-product attention runs 4 times, once per query head, always against that same shared K and V. The 4 head outputs, each B by 3 by 128, are concatenated back to B by 3 by 512 and passed through an output linear layer to produce the multi-query attention output, shape B by 3 by 512.">
<defs>
  <marker id="mqa-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="mqa-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="13" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="300,20 600,20 614,76 286,76" filter="url(#mqa-rough)"/>
<text x="450" y="45" class="lbl" text-anchor="middle">Input Tokens</text>
<text x="450" y="63" class="sub" text-anchor="middle">(B, 3, 512)</text>
<line x1="450" y1="76" x2="450" y2="110" class="arrow"/>
<line x1="450" y1="110" x2="150" y2="152" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<line x1="450" y1="110" x2="450" y2="152" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<line x1="450" y1="110" x2="750" y2="152" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<rect class="proc" x="60" y="152" width="180" height="56" rx="10" filter="url(#mqa-rough)"/>
<text x="150" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="150" y="198" class="sub" text-anchor="middle">W_Q: (512, 512)</text>
<rect class="proc" x="360" y="152" width="180" height="56" rx="10" filter="url(#mqa-rough)"/>
<text x="450" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="450" y="198" class="sub" text-anchor="middle">W_K: (128, 512), shared</text>
<rect class="proc" x="660" y="152" width="180" height="56" rx="10" filter="url(#mqa-rough)"/>
<text x="750" y="180" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="750" y="198" class="sub" text-anchor="middle">W_V: (128, 512), shared</text>
<line x1="150" y1="208" x2="150" y2="264" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<line x1="450" y1="208" x2="450" y2="264" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<line x1="750" y1="208" x2="750" y2="264" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<rect x="90" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="150" y="240" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect x="390" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="240" class="shapetxt" text-anchor="middle">(B, 3, 128)</text>
<rect x="690" y="225" width="120" height="22" rx="6" class="shapepill"/>
<text x="750" y="240" class="shapetxt" text-anchor="middle">(B, 3, 128)</text>
<polygon class="term" points="80,264 220,264 230,314 70,314" filter="url(#mqa-rough)"/>
<text x="150" y="288" class="lbl" text-anchor="middle">Q</text>
<text x="150" y="304" class="sub" text-anchor="middle">4 heads &times; 128</text>
<polygon class="term" points="380,264 520,264 530,314 370,314" filter="url(#mqa-rough)"/>
<text x="450" y="288" class="lbl" text-anchor="middle">K</text>
<text x="450" y="304" class="sub" text-anchor="middle">shared, 1 head</text>
<polygon class="term" points="680,264 820,264 830,314 670,314" filter="url(#mqa-rough)"/>
<text x="750" y="288" class="lbl" text-anchor="middle">V</text>
<text x="750" y="304" class="sub" text-anchor="middle">shared, 1 head</text>
<path d="M 150 314 C 150 344, 260 358, 330 380" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<line x1="450" y1="314" x2="450" y2="380" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<path d="M 750 314 C 750 344, 640 358, 570 380" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<rect class="proc" x="190" y="380" width="520" height="74" rx="10" filter="url(#mqa-rough)"/>
<text x="450" y="408" class="lbl" text-anchor="middle">Scaled Dot-Product Attention &times; 4</text>
<text x="450" y="426" class="sub" text-anchor="middle">same shared K, V reused for every head</text>
<text x="450" y="442" class="sub" text-anchor="middle">(only Q differs per head)</text>
<line x1="450" y1="454" x2="450" y2="500" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<rect x="380" y="463" width="140" height="22" rx="6" class="shapepill"/>
<text x="450" y="478" class="shapetxt" text-anchor="middle">(B, 4, 3, 128)</text>
<rect class="proc" x="350" y="500" width="200" height="50" rx="10" filter="url(#mqa-rough)"/>
<text x="450" y="524" class="lbl" text-anchor="middle">Concat Heads</text>
<text x="450" y="542" class="sub" text-anchor="middle">&rarr; (B, 3, 512)</text>
<line x1="450" y1="550" x2="450" y2="596" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<rect x="390" y="559" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="574" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<rect class="proc" x="350" y="596" width="200" height="56" rx="10" filter="url(#mqa-rough)"/>
<text x="450" y="624" class="lbl" text-anchor="middle">Linear Layer</text>
<text x="450" y="642" class="sub" text-anchor="middle">W_O: (512, 512)</text>
<line x1="450" y1="652" x2="450" y2="698" class="arrow" marker-end="url(#mqa-arrowhead)"/>
<rect x="390" y="661" width="120" height="22" rx="6" class="shapepill"/>
<text x="450" y="676" class="shapetxt" text-anchor="middle">(B, 3, 512)</text>
<polygon class="term" points="300,698 600,698 614,754 286,754" filter="url(#mqa-rough)"/>
<text x="450" y="722" class="lbl" text-anchor="middle">MQA Output</text>
<text x="450" y="738" class="sub" text-anchor="middle">(B, 3, 512)</text>
</svg>
          <figcaption>Fig. 21. Multi-Query Attention (MQA) architecture.</figcaption>
        </figure>
      </div>

      <h3 id="kv-cache">But What Is a KV Cache?</h3>
      <p>If you've come across <strong>prompt caching</strong> or <strong>context caching</strong> in Claude's or OpenAI's pricing pages, this is the principle underneath it: reusing cached K/V vectors instead of recomputing them is what lets long, back-and-forth conversations get up to 90% cheaper on repeat calls.</p>
      <p>Autoregressive decoding, another name for next-token prediction in LLMs, generates one token at a time. At every step, the token currently being processed is turned into <code>Q</code>, <code>K</code>, and <code>V</code> vectors through the <code>W_Q</code>, <code>W_K</code>, and <code>W_V</code> weight matrices, then <code>Q</code> is multiplied by <code>K<sup>T</sup></code> and the result is multiplied by <code>V</code>.</p>
      <p>in <code>Q &middot; K<sup>T</sup></code>, each row of <code>Q</code> gets dotted against every column of <code>K<sup>T</sup></code>.<strong> A row of <code>Q</code> corresponds to one token, so that row is the token currently being predicted for, scored against its own key and every past token's key.</strong> Once a token has been processed, <strong>its key and value vectors are fixed</strong>; nothing about generating the next token alters an earlier token's <code>K</code> or <code>V</code>.</p>
        <p>A naive decoder that reprocesses the whole sequence from scratch at every step ends up computing each earlier token's <code>K</code>/<code>V</code> again and again, once per later step, <strong>for <code>O(N&sup2;)</code> K/V computations across a full decode.</strong> With caching, each token's <code>K</code>/<code>V</code> is computed exactly once, the moment it's first seen, and <strong>just looked up afterward in <code>O(1)</code>, for <code>O(N)</code> total.</strong> Only the newest token's <code>Q</code>, <code>K</code>, and <code>V</code> get computed fresh at each step; everything already in the cache is reused as-is.What we are gaining in efficiency by doing less computations <strong>we are losing in memory by saving these KV caches.</strong></p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="https://miro.medium.com/v2/resize:fit:720/format:webp/1*uyuyOW1VBqmF5Gtv225XHQ.gif" target="_blank" rel="noopener"><img src="https://miro.medium.com/v2/resize:fit:720/format:webp/1*uyuyOW1VBqmF5Gtv225XHQ.gif" alt="Animated diagram of KV caching during autoregressive decoding: at each new step, only the newest token's key and value are computed and appended to the cache, while previously cached keys and values are reused unchanged, so attention is computed against a growing cache instead of recomputing every past key and value from scratch."></a>
        </div>
        <figcaption class="figure-caption">Fig. 22. KV caching in motion: at every new decoding step, only the newest token's K and V are computed and appended; everything already in the cache is reused as-is. From <a href="https://medium.com/@joaolages/kv-caching-explained-276520203249" target="_blank" rel="noopener">KV caching explained</a> (Joao Lages).</figcaption>
      </figure>

      <h3 id="memory-time-footprint">Memory and Compute Footprint: Self-Attention vs. MHA vs. MQA</h3>
      <p>Attention blocks contribute majority of the LLM architectures, so optimizing the attention op greatly reaps benefits in inference efficiency.</p>
      <h4 id="compute-footprint">Compute footprint</h4>
      <p>Self attention and MHA use the same amount of FLOPS for <code>Q</code>, <code>K</code>, <code>V</code> vector computation since <strong>we are just splitting the embedding dim into <code>h</code> heads.</strong> The final output vector in the attention block computed by the projection matrix <code>W_o</code> is where MHA adds the extra <code>embedding_dim &times; embedding_dim</code> MACs (MACs = multiply-accumulates, 1 FLOP = 2 &times; MACs). <br><strong>For MQA, it's the same as MHA for the <code>Q</code> vector,</strong> but since we only use 1 head for <code>K</code> and <code>V</code>, each takes <code>embedding_dim &times; (embedding_dim / n_heads)</code> MACs. The projection matrix <code>W_o</code> computation remains identical for MQA and MHA.</p>
      <p>Some napkin math:<br>
      <code>d = embedding dim</code>, <code>h = heads</code></p>
      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Variant</th><th><code>W_Q</code></th><th><code>W_K</code></th><th><code>W_V</code></th><th><code>W_O</code></th><th>Total MACs</th></tr></thead>
          <tbody>
            <tr><td>Self-Attention</td><td><code>d&sup2;</code></td><td><code>d&sup2;</code></td><td><code>d&sup2;</code></td><td>none</td><td><code>3d&sup2;</code></td></tr>
            <tr><td>Multi-Head Attention (MHA)</td><td><code>d&sup2;</code></td><td><code>d&sup2;</code></td><td><code>d&sup2;</code></td><td><code>d&sup2;</code></td><td><code>4d&sup2;</code></td></tr>
            <tr><td>Multi-Query Attention (MQA)</td><td><code>d&sup2;</code></td><td><code>d&sup2;/h</code></td><td><code>d&sup2;/h</code></td><td><code>d&sup2;</code></td><td><code>2d&sup2; + 2d&sup2;/h</code></td></tr>
          </tbody>
        </table>
        <p class="table-caption">Table 1. Compute cost (MACs) by attention variant.</p>
      </div>
      <p><strong>Note:</strong> for multiple heads, <code>h &times; (d &times; d/h) = d&sup2;</code>.</p>
      <p>Other than this, the remaining FLOPs come from attention score computation, which is dot-products + weighted-sum MACs (for a full sequence of length <code>n</code> tokens, one layer): <code>2n&sup2; &middot; d</code>.</p>
      <p><strong>How <code>2n&sup2; &middot; d</code>:</strong> <code>QK<sup>T</sup></code> computes the raw score between every query and every key: there are <code>n</code> queries and <code>n</code> keys, so <code>n &times; n = n&sup2;</code> dot products, and each dot product is between two <code>d</code>-dimensional vectors, <code>d</code> multiply-accumulates (MACs) each, for a total of <code>n&sup2; &middot; d</code> MACs. <code>softmax(QK<sup>T</sup>) &middot; V</code> is the weighted sum over values: for each of the <code>n</code> output positions, you're computing a weighted sum of <code>n</code> value vectors, each <code>d</code>-dimensional, the same shape as above, <code>n</code> positions &times; <code>n</code> values &times; <code>d</code> dims = <code>n&sup2; &middot; d</code> MACs.</p>
      <p>So it's identical across all three, regardless of how many heads or whether K/V are shared. Even true for MQA, <strong>since all <code>h</code> query heads still run their own separate score computation against the shared K/V.</strong></p>
      <p><strong>With KV cache</strong>, we don't need to recompute every past token's K/V again at every step, we also <strong>pass only the new token through <code>W_Q</code>, <code>W_K</code>, <code>W_V</code>, not the entire token length <code>N</code>, </strong>so the cost comes down from <code>O(N&sup2;)</code> to <code>O(N)</code>.<br>
      For the attention-score computation, instead of one <code>2n&sup2; &middot; d</code> pass over the whole sequence, <strong>decoding does one new query row scored against the <code>t</code> cached keys at each step: <code>O(t &middot; d)</code> MACs,</strong> linear in however long the cache has grown, not quadratic.</p>
      <h4 id="memory-footprint">Memory footprint</h4>
      <p>The real difference between the three isn't compute, it's the KV cache: how much has to be kept around and re-read at every decoding step.</p>

      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Variant</th><th>Query heads</th><th>KV heads</th><th>KV cache per token per layer</th></tr></thead>
          <tbody>
            <tr><td>Self-Attention (single head)</td><td>1</td><td>1</td><td><code>2d</code></td></tr>
            <tr><td>Multi-Head Attention (MHA)</td><td>h</td><td>h</td><td><code>2 &times; h &times; d_k = 2d</code></td></tr>
            <tr class="hl"><td>Multi-Query Attention (MQA)</td><td>h</td><td>1</td><td><code>2 &times; d_k = 2d / h</code></td></tr>
          </tbody>
        </table>
        <p class="table-caption">Table 2. KV cache memory footprint by attention variant.</p>
      </div>
      <p>KV cache size of MHA and self-attention is the same, since separate per-head K/V projections still add up to <code>d</code> embedding dimensions. <strong>The total cache size is <code>2 &times; b &times; n &times; d_h &times; n_h &times; L</code></strong>, where <code>n</code> = sequence length, <code>L</code> = layers, <code>2</code> is K and V together, <code>d_h</code> is head dim, <code>n_h</code> is the number of KV heads, and <code>b</code> is bytes per element (2 for fp16, 1 for int8).</p>
      <p>Let's put in actual numbers: assume a 32k sequence/context length request sent to an LLM with 8 MHA blocks, <code>d_h = 256</code>, <code>n_h = 8</code> KV heads, running in fp16 precision:</p>
      <p><code>2 &times; 2 &times; 32,768 &times; 256 &times; 8 &times; 8 = 2,147,483,648</code> bytes &asymp; <strong>2 GiB</strong> of KV cache, for a single request (batch = 1).</p>
      <p>This amount of GB space will be used by the KV cache along with the model parameters sitting in HBM of your GPU. You can see this going out of hand very quickly, and that's before multiplying by concurrent requests. <strong>The same setup with MQA (<code>n_h = 1</code>) needs <code>1/8</code> of that: 256 MiB instead of 2 GiB.</strong></p>
      <p>KV cache turned the token decoding step from compute bound to memory bound. MQA turned the problem from memory bound to bandwidth bound, the time required to move the KV cache in and out of HBM.</p>
    </section>

    <section style="margin-bottom: 1.5rem;">
      <h2 id="tokenizer-vs-embedding">Tokenizer vs. Embedding Table</h2>
      <p>The tokenizer and embedding table sit at the very top of the architecture.</p>

      <h3 id="tokenizer-step">Tokenizer: Text &rarr; Token IDs</h3>
      <p>The tokenizer's job is to convert text into a numerical representation the model can work with, a simple lookup. A fixed vocabulary (257,152 entries) splits text into subword pieces and maps each one to an integer:</p>
      <pre class="formula">"a cat" &rarr; [235, 8055]</pre>

      <h3 id="embedding-step">Embedding Table: Token IDs &rarr; Vectors</h3>
      <p>The embedding table (or embedding layer) converts each token ID from the tokenizer into vector form for the model to work on. <code>embed_tokens</code> is <code>nn.Embedding(257152, 2048)</code>, a lookup table where the token ID is simply the row index:</p>
      <pre class="formula">[235, 8055] &rarr; [[0.12, -0.34, ...],   # 2048-dim vector for token 235
               [0.87,  0.21, ...]]   # 2048-dim vector for token 8055</pre>

      <p class="code-filename"><code>paligemma_processor.py</code></p>
      <pre class="formula highlight"><code><span class="k">class</span> <span class="nc">PaliGemmaProcessor</span><span class="p">:</span>
      <span class="sh">'''</span><span class="s">Responsible for text to tokens and processing images into pxs,
      and also return attn mask
      </span><span class="sh">'''</span>
      <span class="n">IMAGE_TOKEN</span> <span class="o">=</span> <span class="sh">"</span><span class="s">&lt;image&gt;</span><span class="sh">"</span>

      <span class="k">def</span> <span class="nf">__init__</span><span class="p">(</span><span class="n">self</span><span class="p">,</span> <span class="n">tokenizer</span><span class="p">,</span> <span class="n">num_image_tokens</span><span class="p">,</span> <span class="n">image_size</span><span class="p">):</span>
            <span class="nf">super</span><span class="p">().</span><span class="nf">__init__</span><span class="p">()</span>
            <span class="n">self</span><span class="p">.</span><span class="n">image_seq_length</span> <span class="o">=</span> <span class="n">num_image_tokens</span>
            <span class="n">self</span><span class="p">.</span><span class="n">image_size</span> <span class="o">=</span> <span class="n">image_size</span>
            <span class="n">tokens_to_add</span> <span class="o">=</span> <span class="p">{</span><span class="sh">"</span><span class="s">additional_special_tokens</span><span class="sh">"</span><span class="p">:</span> <span class="p">[</span><span class="n">self</span><span class="p">.</span><span class="n">IMAGE_TOKEN</span><span class="p">]}</span>
            <span class="n">tokenizer</span><span class="p">.</span><span class="nf">add_special_token</span><span class="p">(</span><span class="n">tokens_to_add</span><span class="p">)</span>
            <span class="n">EXTRA_TOKENS</span> <span class="o">=</span> <span class="p">[</span>
                  <span class="sa">f</span><span class="sh">"</span><span class="s">&lt;loc</span><span class="si">{</span><span class="n">i</span><span class="si">:</span><span class="mi">04</span><span class="n">d</span><span class="si">}</span><span class="s">&gt;</span><span class="sh">"</span> <span class="k">for</span> <span class="n">i</span> <span class="ow">in</span> <span class="nf">range</span><span class="p">(</span><span class="mi">1024</span><span class="p">)</span>
            <span class="p">]</span>  <span class="c1"># These tokens are used for object detection (bounding boxes)
</span>            <span class="n">EXTRA_TOKENS</span> <span class="o">+=</span> <span class="p">[</span>
                  <span class="sa">f</span><span class="sh">"</span><span class="s">&lt;seg</span><span class="si">{</span><span class="n">i</span><span class="si">:</span><span class="mi">03</span><span class="n">d</span><span class="si">}</span><span class="s">&gt;</span><span class="sh">"</span> <span class="k">for</span> <span class="n">i</span> <span class="ow">in</span> <span class="nf">range</span><span class="p">(</span><span class="mi">128</span><span class="p">)</span>
            <span class="p">]</span>  <span class="c1"># These tokens are used for object segmentation
</span>            <span class="n">tokenizer</span><span class="p">.</span><span class="nf">add_tokens</span><span class="p">(</span><span class="n">EXTRA_TOKENS</span><span class="p">)</span>
            <span class="n">self</span><span class="p">.</span><span class="n">image_token_id</span> <span class="o">=</span> <span class="n">tokenizer</span><span class="p">.</span><span class="nf">convert_tokens_to_ids</span><span class="p">(</span>
                  <span class="n">self</span><span class="p">.</span><span class="n">IMAGE_TOKEN</span>
            <span class="p">)</span>
            <span class="n">tokenizer</span><span class="p">.</span><span class="n">add_bos_token</span> <span class="o">=</span> <span class="bp">False</span>
            <span class="n">tokenizer</span><span class="p">.</span><span class="n">add_eos_token</span> <span class="o">=</span> <span class="bp">False</span>

            <span class="n">self</span><span class="p">.</span><span class="n">tokenizer</span> <span class="o">=</span> <span class="n">tokenizer</span>

      <span class="k">def</span> <span class="nf">__call__</span><span class="p">(</span><span class="n">self</span><span class="p">,</span> <span class="n">text</span><span class="p">,</span> <span class="n">images</span><span class="p">,</span> <span class="n">padding</span><span class="o">=</span><span class="sh">'</span><span class="s">longest</span><span class="sh">'</span><span class="p">,</span> <span class="n">truncation</span><span class="o">=</span><span class="bp">True</span><span class="p">):</span>
            <span class="n">pixel_values</span> <span class="o">=</span> <span class="nf">process_images</span><span class="p">(</span>
                  <span class="n">images</span><span class="p">,</span> <span class="n">size</span><span class="o">=</span><span class="p">(</span><span class="n">self</span><span class="p">.</span><span class="n">image_size</span><span class="p">,</span> <span class="n">self</span><span class="p">.</span><span class="n">image_size</span><span class="p">),</span>
                  <span class="n">resample</span><span class="o">=</span><span class="n">Image</span><span class="p">.</span><span class="n">Resampling</span><span class="p">.</span><span class="n">BICUBIC</span><span class="p">,</span>
                  <span class="n">rescale_factor</span><span class="o">=</span><span class="mi">1</span> <span class="o">/</span> <span class="mf">255.0</span><span class="p">,</span>
                  <span class="n">image_mean</span><span class="o">=</span><span class="n">IMAGENET_STANDARD_MEAN</span><span class="p">,</span>
                  <span class="n">image_std</span><span class="o">=</span><span class="n">IMAGENET_STANDARD_STD</span><span class="p">,</span>
            <span class="p">)</span>
            <span class="n">pixel_values</span> <span class="o">=</span> <span class="n">np</span><span class="p">.</span><span class="nf">stack</span><span class="p">(</span><span class="n">pixel_values</span><span class="p">,</span> <span class="n">axis</span><span class="o">=</span><span class="mi">0</span><span class="p">)</span>
            <span class="n">pixel_values</span> <span class="o">=</span> <span class="n">torch</span><span class="p">.</span><span class="nf">tensor</span><span class="p">(</span><span class="n">pixel_values</span><span class="p">)</span>
            <span class="n">input_strings</span> <span class="o">=</span> <span class="p">[</span>
                  <span class="nf">add_image_tokens_to_prompt</span><span class="p">(</span>
                        <span class="n">prefix_prompt</span><span class="o">=</span><span class="n">prompt</span><span class="p">,</span>
                        <span class="n">bos_token</span><span class="o">=</span><span class="n">self</span><span class="p">.</span><span class="n">tokenizer</span><span class="p">.</span><span class="n">bos_token</span><span class="p">,</span>
                        <span class="n">image_seq_len</span><span class="o">=</span><span class="n">self</span><span class="p">.</span><span class="n">image_seq_length</span><span class="p">,</span>
                        <span class="n">image_token</span><span class="o">=</span><span class="n">self</span><span class="p">.</span><span class="n">IMAGE_TOKEN</span><span class="p">,</span>
                  <span class="p">)</span>
                  <span class="k">for</span> <span class="n">prompt</span> <span class="ow">in</span> <span class="n">text</span>
            <span class="p">]</span>
            <span class="n">inputs</span> <span class="o">=</span> <span class="n">self</span><span class="p">.</span><span class="nf">tokenizer</span><span class="p">(</span>
                  <span class="n">input_strings</span><span class="p">,</span>
                  <span class="n">return_tensors</span><span class="o">=</span><span class="sh">'</span><span class="s">pt</span><span class="sh">'</span><span class="p">,</span>
                  <span class="n">padding</span><span class="o">=</span><span class="n">padding</span><span class="p">,</span>
                  <span class="n">truncation</span><span class="o">=</span><span class="n">truncation</span><span class="p">,</span>
            <span class="p">)</span>
            <span class="k">return</span> <span class="p">{</span><span class="sh">'</span><span class="s">pixel_values</span><span class="sh">'</span><span class="p">:</span> <span class="n">pixel_values</span><span class="p">,</span> <span class="o">**</span><span class="n">inputs</span><span class="p">}</span></code></pre>
      <p>The <code>PaliGemmaProcessor</code> class converts input image and input text into pixel values and text tokens respectively. Since it wraps a Gemma 2 tokenizer, it also adds <code>&lt;image&gt;</code>, <code>&lt;seg&gt;</code>, and <code>&lt;loc&gt;</code> tokens, for handling image, segmentation, and detection/location tokens in input or output text. The <code>add_image_tokens_to_prompt</code> helper is where the actual prompt string gets built: 256 <code>&lt;image&gt;</code> placeholders first, then BOS, then the raw prompt, then a newline: <code>[image tokens..., BOS, prefix tokens..., SEP, ...]</code></p>

      <h3 id="weight-tying">Weight Tying</h3>
      <p>This concept was new to me, and it stuck. Right after the tokenizer, an embedding table converts token IDs into vectors: <code>(batch, seq_len)</code> &rarr; <code>(batch, seq_len, embed_dim)</code>. At the very end of the network sits a mirror-image layer that does the opposite: it takes those processed vectors and converts them back into token IDs. Both are doing a similar operation, on similar-shaped weight matrices: <code>embed_tokens.weight</code>, shape <code>(257152, 2048)</code>, for the lookup, and its transpose, <code>embed_tokens.weight.T</code>, shape <code>(2048, 257152)</code>, for the reverse. <strong>It turns out they use the same weight matrix.</strong></p>

      <div style="display:flex; gap:1.5rem; flex-wrap:wrap; align-items:flex-start; margin-top:1.2rem;">
      <div class="diagram-wrap is-compact" style="flex:1 1 320px; margin-top:0;">
        <figure>
<svg viewBox="100 0 480 330" role="img" aria-label="Embedding lookup with concrete shapes: a batch of token ids, shape batch by seq_len, is passed through a linear layer whose weight is embed_tokens.weight, shape 257152 by 2048, producing one 2048-dimensional embedding vector per token id, shape batch by seq_len by 2048.">
<defs>
  <marker id="emb-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="emb-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="19" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="190,20 490,20 504,76 176,76" filter="url(#emb-rough)"/>
<text x="340" y="49" class="lbl" text-anchor="middle">Input Token IDs</text>
<text x="340" y="67" class="sub" text-anchor="middle">(batch, seq_len)</text>
<line x1="340" y1="76" x2="340" y2="130" class="arrow" marker-end="url(#emb-arrowhead)"/>
<rect x="282.4" y="92.0" width="115.2" height="22" rx="6" class="shapepill"/>
<text x="340" y="107.0" class="shapetxt" text-anchor="middle">(batch, seq_len)</text>
<rect class="proc" x="170" y="130" width="340" height="64" rx="10" filter="url(#emb-rough)"/>
<text x="340" y="148" class="lbl" text-anchor="middle">Linear Layer (embedding lookup)</text>
<text x="340" y="166" class="sub" text-anchor="middle">W = embed_tokens.weight: (257152, 2048)</text>
<text x="340" y="182" class="sub" text-anchor="middle">row lookup &equiv; one-hot(id) @ W</text>
<line x1="340" y1="194" x2="340" y2="248" class="arrow" marker-end="url(#emb-arrowhead)"/>
<rect x="260.8" y="210.0" width="158.4" height="22" rx="6" class="shapepill"/>
<text x="340" y="225.0" class="shapetxt" text-anchor="middle">(batch, seq_len, 2048)</text>
<polygon class="term" points="190,248 490,248 504,304 176,304" filter="url(#emb-rough)"/>
<text x="340" y="277" class="lbl" text-anchor="middle">Embedding Vectors</text>
<text x="340" y="295" class="sub" text-anchor="middle">(batch, seq_len, 2048)</text>
</svg>
          <figcaption>Fig. 36. Embedding lookup architecture.</figcaption>
        </figure>
      </div>
      <div class="diagram-wrap is-compact" style="flex:1 1 320px; margin-top:0;">
        <figure>
<svg viewBox="100 0 480 330" role="img" aria-label="LM head with concrete shapes: a batch of hidden states, shape batch by seq_len by 2048, is passed through a linear layer whose weight is embed_tokens.weight transposed, shape 2048 by 257152, producing logits over the vocabulary, shape batch by seq_len by 257152.">
<defs>
  <marker id="lmh-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="lmh-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="19" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="190,20 490,20 504,76 176,76" filter="url(#lmh-rough)"/>
<text x="340" y="49" class="lbl" text-anchor="middle">Hidden State</text>
<text x="340" y="67" class="sub" text-anchor="middle">(batch, seq_len, 2048)</text>
<line x1="340" y1="76" x2="340" y2="130" class="arrow" marker-end="url(#lmh-arrowhead)"/>
<rect x="260.8" y="92.0" width="158.4" height="22" rx="6" class="shapepill"/>
<text x="340" y="107.0" class="shapetxt" text-anchor="middle">(batch, seq_len, 2048)</text>
<rect class="proc" x="170" y="130" width="340" height="64" rx="10" filter="url(#lmh-rough)"/>
<text x="340" y="148" class="lbl" text-anchor="middle">Linear Layer (LM head)</text>
<text x="340" y="166" class="sub" text-anchor="middle">W&#7488; = embed_tokens.weight.T: (2048, 257152)</text>
<text x="340" y="182" class="sub" text-anchor="middle">hidden_states @ W&#7488;</text>
<line x1="340" y1="194" x2="340" y2="248" class="arrow" marker-end="url(#lmh-arrowhead)"/>
<rect x="253.6" y="210.0" width="172.8" height="22" rx="6" class="shapepill"/>
<text x="340" y="225.0" class="shapetxt" text-anchor="middle">(batch, seq_len, 257152)</text>
<polygon class="term" points="190,248 490,248 504,304 176,304" filter="url(#lmh-rough)"/>
<text x="340" y="277" class="lbl" text-anchor="middle">Logits</text>
<text x="340" y="295" class="sub" text-anchor="middle">(batch, seq_len, 257152)</text>
</svg>
          <figcaption>Fig. 37. LM head architecture.</figcaption>
        </figure>
      </div>
      </div>

      <p style="margin-top: 1.2rem;">If you go back to the <a href="#gemma-2b-architecture">Gemma-2B architecture</a>, you'll notice an additional step right after the embedding layer: <strong>embedding scaling</strong>. <code>nn.Embedding</code> initializes from <code>N(0, 1)</code>, small values, roughly &minus;3 to 3. Logits computed directly at that scale would sit near zero and be hard to distinguish, so embeddings are multiplied by <code>&radic;hidden_size &asymp; 45.3</code> right after lookup, bringing the shared matrix up to the scale the rest of the network (and the output logits) actually need.</p>

    </section>

    <section>
      <h2 id="positional-embeddings">Positional Embeddings</h2>

      <p>Both SigLip Vision encoder and Gemma 2B has a component called Position embedding which is added to token embedding. <strong>Self-attention on its own has no notion of order.</strong> It's just a weighted sum over the sequence based on content similarity. Shuffle the input tokens and the attention scores shuffle right along with them. It would treat "the dog bit the man" and "the man bit the dog" as the same bag of tokens. So positional information needs to be injected into tokens before the attention op.</p>

      <figure class="figure">
        <div class="figure-frame">
          <a href="https://sebastianraschka.com/images/LLMs-from-scratch-images/ch02_compressed/18.webp" target="_blank" rel="noopener"><img src="https://sebastianraschka.com/images/LLMs-from-scratch-images/ch02_compressed/18.webp" alt="Diagram showing input embeddings as the sum of token embeddings and positional embeddings: identical token embeddings at different sequence positions are added to different positional embedding vectors, producing distinct input embeddings even though the underlying token is the same."></a>
        </div>
        <figcaption class="figure-caption">Fig. 23. The simplest fix: give every position in the sequence its own embedding vector, and add it element-wise to the token embedding. Two occurrences of the exact same token end up with different input embeddings purely because they sit at different positions. From <a href="https://sebastianraschka.com/faq/docs/positional-information-transformer.html" target="_blank" rel="noopener">Why do we need positional information in transformers?</a> (Sebastian Raschka).</figcaption>
      </figure>

      <h3 id="absolute-vs-relative">Absolute Positional Embeddings</h3>
      <p>Absolute positional embedding can further be classified into 2 categories:</p>
      <ul>
        <li><strong>Learned</strong>: embedding vectors are initialized randomly and trained during training, one per position index. SigLIP's vision embeddings work exactly this way: a learned <code>position_embedding</code> table with one entry per patch index, added to the patch embedding at the very start.
          <pre class="formula highlight"><code><span class="n">self</span><span class="p">.</span><span class="n">position_embedding</span> <span class="o">=</span> <span class="n">nn</span><span class="p">.</span><span class="nc">Embedding</span><span class="p">(</span><span class="n">num_positions</span><span class="p">,</span> <span class="n">embed_dim</span><span class="p">)</span>
<span class="c1"># one row per patch index, added to the patch embedding
</span><span class="n">embeddings</span> <span class="o">=</span> <span class="n">patch_embeds</span> <span class="o">+</span> <span class="n">self</span><span class="p">.</span><span class="nf">position_embedding</span><span class="p">(</span><span class="n">position_ids</span><span class="p">)</span></code></pre>
        </li>
        <li><strong>Fixed (sinusoidal)</strong>: introduced in the original <strong>Attention Is All You Need</strong> paper: sine and cosine functions of different frequencies create a unique pattern per position, with no parameters to learn at all:
          <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 4.</p>
          <div class="formula">$$PE(pos, 2i) = \sin\left(\frac{pos}{10000^{2i/d}}\right) \quad \text{for even indices}$$
$$PE(pos, 2i+1) = \cos\left(\frac{pos}{10000^{2i/d}}\right) \quad \text{for odd indices}$$</div>
        </li>
      </ul>
      <p>I found this great explanation on this by <a href="https://thegustafson.com/blog/positional-encodings-and-rope" target="_blank" rel="noopener">Nick Gustafson</a>:</p>
      <blockquote>
        <p>Each dimension gets a sine or cosine wave, and the frequency decreases as you move to higher dimensions. The low-order dimensions oscillate fast, changing rapidly from position to position. The high-order dimensions oscillate slowly, barely changing across dozens of positions.</p>
        <p>The intuition I find most helpful is the clock analogy. A clock has a second hand (high frequency, fine resolution), a minute hand (medium frequency), and an hour hand (low frequency). Together the three hands uniquely identify any time within a 12-hour cycle. Sinusoidal encodings work the same way: the combination of different-frequency waves produces a unique fingerprint for each position.</p>
      </blockquote>
      <p>Both encodings share the same limitation that a fixed-size table (or a formula tied to an absolute index) only ever encodes that a given token is at a position but says nothing <strong>how its position is relative to other tokens</strong>, this forces the model to work this relationship indirectly using two absolute numbers and <strong>neither generalizes past whatever length it was built for.</strong><br>
Since we are adding position information into actual token's content, the model has to learn to disentangle "what token is this" from "where does it sit" out of a single combined vector.
</p>

      <h3 id="relative-embeddings">Relative Positional Embeddings</h3>
      <p>Positional embeddings are required by only 1 op in the transformer i.e attention block and within the attention block -- the attention score computation, specifically for the purpose to guide which token to attend based on their position and content.<br>
      So Relative position representation introduced by Shaw et al.'s Self-Attention with Relative Position Representations, later popularized by Press, Smith, and Lewis, "Train Short, Test Long: Attention with Linear Biases Enables Input Length Extrapolation", short for ALiBi.<strong> It directly injects the relative bias to the dot-product operation.</strong> 
      </p>
      <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 5.</p>
      <div class="formula">$$\text{Attention}(Q,K,V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}} - m \cdot |i-j|\right)V$$</div>
      <p>Where <code>i</code> = query position and <code>j</code> = key position, <code>m</code> = the slope for each head. Since <code>m</code> changes per head, for some head larger values of <code>m</code> accentuate the <code>i&minus;j</code> difference, <strong>forcing that head to attend in a more local window, while smaller <code>m</code> values are less punishing and allow for longer ranges.</strong></p>

      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/paligemma-3b/alibi-figure3.png" alt="Figure 3 from the ALiBi paper: a lower-triangular matrix of raw attention scores q_i dot k_j on the left, plus a lower-triangular matrix of linear distance penalties (0, -1, -2, -3, -4 down each column) on the right, scaled by a head-specific scalar m, producing the final biased attention scores.">
        </div>
        <figcaption class="figure-caption">Fig. 24. ALiBi adds a constant, non-learned bias to each raw attention score based purely on the distance between query and key, scaled by a fixed head-specific slope <code>m</code>, before the softmax. Figure 3 from <a href="https://arxiv.org/pdf/2108.12409" target="_blank" rel="noopener">Train Short, Test Long</a> (Press, Smith &amp; Lewis, 2022).</figcaption>
      </figure>
      <p>Fig. 24 shows how this plays out during multi-step decoding: at timestep <code>i=2</code>, query <code>q<sub>2</sub></code> can only look at the current key <code>k<sub>2</sub></code> and the earlier key <code>k<sub>1</sub></code>, and the positional bias tells it that <code>k<sub>1</sub></code> sits one token position behind.</p>
      <p>Relative positional embeddings are applied at each attention block, so they stay fresh at every layer and don't get disentangled from content the way fixed (absolute) positional embeddings can in later layers of the network.
      ALiBi is simple to implement and <strong>extrapolates well to longer contexts, but far-off tokens always receive a penalty</strong>. The model can still attend to them if the raw attention score is high enough, it just has to overcome the bias to do so.</p>

      <h3 id="rope">Rotary Positional Embedding (RoPE)</h3>
      <p>RoPE (Su et al., 2021) combines benefits of both absolute and relative embeddings by rotating <code>Q</code> and <code>K</code> vectors in a high-dimensional space; the amount of rotation depends on the token's position in the sequence. The embedding itself is left alone, no addition.<br><strong> Given a token, RoPE rotates its key and query vectors by multiplying them with a rotation matrix based on the token's position.</strong> The rotated vectors then feed into attention exactly as usual (dot product, then softmax); nothing else in the transformer changes.</p>

      <p>The mechanism is straightforward: pair up the dimensions of the query vector, <code>(q<sub>0</sub>, q<sub>1</sub>)</code>, <code>(q<sub>2</sub>, q<sub>3</sub>)</code>, <code>(q<sub>4</sub>, q<sub>5</sub>)</code>, and so on. Each pair lives in its own 2D plane, and each one gets rotated independently:</p>
      <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 6.</p>
      <div class="formula">$$\begin{pmatrix} q_{2i}' \\ q_{2i+1}' \end{pmatrix} = \begin{pmatrix} \cos(m\theta_i) & -\sin(m\theta_i) \\ \sin(m\theta_i) & \cos(m\theta_i) \end{pmatrix} \begin{pmatrix} q_{2i} \\ q_{2i+1} \end{pmatrix}$$</div>

      <details class="collapsible">
        <summary><h4 style="font-size: .88rem; text-transform: uppercase; letter-spacing: .06em; color: var(--muted);">Mathematical Proof of Relativity</h4></summary>
        <p>Now let's prove that RoPE is relative: that the attention score between two tokens depends only on their relative positions, not their absolute positions.</p>
        <p>Define the RoPE operation as rotating a projected vector by an angle proportional to its position, where <code>x</code> is the projected query or key vector, <code>&theta;</code> is that dimension pair's fixed rotation frequency, and <code>m</code> is the token's position in the sequence:</p>
        <div class="formula">$$\text{RoPE}(x, \theta, m) = R(m\theta)\,x$$</div>
        <p>Consider two tokens at positions <code>m</code> and <code>n</code>:</p>
        <div class="formula">$$q_m = R(m\theta)\,W_Q x_m \qquad k_n = R(n\theta)\,W_K x_n$$</div>
        <p>We calculate the attention score as their dot product, and expand it:</p>
        <div class="formula">$$q_m \cdot k_n = \left(R(m\theta)\,W_Q x_m\right)^T \left(R(n\theta)\,W_K x_n\right) = x_m^T W_Q^T\, R(m\theta)^T R(n\theta)\, W_K x_n$$</div>
        <p>Rotation matrices have the nice property that:</p>
        <div class="formula">$$R(m\theta)^T R(n\theta) = R\big((n-m)\theta\big)$$</div>
        <p>Therefore the attention score becomes:</p>
        <div class="formula">$$q_m \cdot k_n = x_m^T W_Q^T\, R\big((n-m)\theta\big)\, W_K x_n$$</div>
        <p>As you can see, the score is a function of the relative position only, the difference between <code>m</code> and <code>n</code>, and never depends on their absolute values.</p>
        <p>The magic is in the dot product. When you compute <code>q(pos<sub>m</sub>) &middot; k(pos<sub>n</sub>)</code>, the two rotation matrices partially cancel. What survives depends only on the difference <code>m&minus;n</code>. So RoPE naturally encodes relative position, which is exactly what attention cares about.</p>
      </details>

      <h4>Rotation Matrix for Higher Dimensions</h4>
      <p>More often than not, the embedding dimension of the model is not 2; it's often much larger. So how does the rotation matrix change? The RoFormer paper's authors proposed the following composition: <strong>for position <code>m</code> and embedding dimension <code>d</code>, the rotation matrix is composed of <code>d/2</code> independent 2&times;2 rotation blocks, each rotating a different pair of dimensions at its own frequency <code>&theta;<sub>i</sub></code>.</strong> Since this construction is sparse (block-diagonal, mostly zeros), the authors recommend a computationally efficient way to compute its product with a token embedding vector <code>x</code>, without ever building the dense matrix:</p>

      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/paligemma-3b/rotation_matrix.png" alt="Equations 14 to 16 from the RoFormer paper: f_q,k(x_m, m) equals the block-diagonal rotary matrix R_Theta,m times W_q,k times x_m, where R_Theta,m is composed of d/2 independent 2x2 rotation blocks each using angle m times theta_i, with Theta the set of predefined frequencies theta_i = 10000^(-2(i-1)/d); applying this to self-attention shows q_m dot k_n equals x transpose W_q R_Theta,(n-m) W_k x_n, a function of the relative position n-m only.">
        </div>
        <figcaption class="figure-caption">Fig. 25. The exact formulation from the RoPE paper: the block-diagonal rotary matrix <code>R<sub>&Theta;,m</sub></code>, and the proof that <code>q<sub>m</sub><sup>T</sup>k<sub>n</sub></code> collapses to a function of <code>n&minus;m</code> alone. From <a href="https://arxiv.org/abs/2104.09864" target="_blank" rel="noopener">RoFormer: Enhanced Transformer with Rotary Position Embedding</a> (Su et al., 2021).</figcaption>
      </figure>

      <p>Each block's frequency <code>&theta;<sub>i</sub></code> is fixed (not learned), and decreases geometrically with the dimension-pair index, the same base-10000 scheme sinusoidal encoding uses:</p>
      <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 7.</p>
      <div class="formula">$$\theta_i = \text{base}^{-2i/d} = \frac{1}{\text{base}^{2i/d}}, \qquad i = 0, 1, \ldots, \frac{d}{2}-1$$</div>

      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/paligemma-3b/rope.png" target="_blank" rel="noopener"><img src="/img/blogs/paligemma-3b/rope.png" alt="Efficient computation of the d-dimensional RoPE rotation matrix multiplied by vector x: the result equals (x1,x2,...,x_d) elementwise-multiplied with (cos m*theta1, cos m*theta1, cos m*theta2, ...), plus (-x2,x1,-x4,x3,...) elementwise-multiplied with (sin m*theta1, sin m*theta1, sin m*theta2, ...)."></a>
        </div>
        <figcaption class="figure-caption">Fig. 26. The efficient, sparse-free computation: one element-wise product of <code>x</code> with the cosines, plus one element-wise product of a "rotate-half" reordering of <code>x</code> with the sines, exactly the form used by Gemma's <code>GemmaRotaryEmbedding</code> in this codebase.</figcaption>
      </figure>

      <p>The above rotation matrix can be simplified into this form, and just with this simple formula you embed <code>m</code>'s position into an <code>x</code> vector of <code>d</code> dimensions. Both <code>K</code> and <code>Q</code> vectors are rotated using RoPE at every attention op.</p>

      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/paligemma-3b/rope2.png" alt="Figure 1 from the RoFormer paper illustrating RoPE for d=2: a query/key vector (x1, x2) with constant theta_1 and position m is rotated by angle m*theta_1 to produce the position-encoded vector (x'1, x'2). Below, a sequence of six tokens (Enhanced, Transformer, with, Rotary, Position, Embedding) at positions 1 through 6 each have their Query/Key vectors, split into dimension pairs with frequencies theta_1 through theta_d/2, rotated by an amount that grows with position, producing distinct Position Encoded Query/Key vectors per token.">
        </div>
        <figcaption class="figure-caption">Fig. 27. Figure 1 from <a href="https://arxiv.org/abs/2104.09864" target="_blank" rel="noopener">RoFormer: Enhanced Transformer with Rotary Position Embedding</a> (Su et al., 2021): each dimension pair rotates by <code>m&theta;<sub>i</sub></code>, and every token in the sequence ends up with its own distinct, position-encoded Q/K vector.</figcaption>
      </figure>

      <h4>Advantages of RoPE</h4>
      <ul>
        <li><strong>Combines absolute and relative.</strong> Each token is still rotated by an angle tied to its own absolute position <code>m</code>, but the resulting attention score collapses to a function of <code>n&minus;m</code> alone, getting us the desired relative properties.</li>
        <li><strong>Extrapolates to longer sequences.</strong> RoPE along with techniques like NTK-aware scaling and YaRN scales well for longer contexts during inference. They work how to modulate the frequency of different dimensions of distant positions to positions known to model.</li>
        <li>Just like ALiBi, RoPE <strong>plays naturally with the KV cache.</strong> RoPE rotates <code>Q</code> and <code>K</code> using each token's own absolute position index, computed once when that token is first processed. We can store this rotated <code>K</code> in cache and keep on using it.</li>
        <li><strong>Long-term decay.</strong> Because RoPE rotates each dimension pair at a different frequency and then sums their contributions, the terms for distant token pairs increasingly land out of phase with each other and partially cancel, so the upper bound on the inner product between two RoPE-rotated vectors shrinks as their relative distance grows. Meaning distant tokens received less weightage during attention. This was a nice property that authors discovered.</li>
      </ul>

      <figure class="figure">
        <div class="figure-frame">
          <img src="/img/blogs/paligemma-3b/rope_decay.png" alt="Figure 2 from the RoFormer paper: a plot of the relative upper bound of the RoPE inner product (y-axis) against relative distance (x-axis, 0 to 256). The curve oscillates but trends steadily downward as relative distance increases, starting near 20 and settling toward roughly 7 by distance 250.">
        </div>
        <figcaption class="figure-caption">Fig. 28. The relative upper bound on the RoPE inner product falls off as relative distance grows. Figure 2 from <a href="https://arxiv.org/abs/2104.09864" target="_blank" rel="noopener">RoFormer: Enhanced Transformer with Rotary Position Embedding</a> (Su et al., 2021).</figcaption>
      </figure>
    </section>

    <section>
      <h2 id="attention-mask">Attention Mask</h2>
      <p>Before transformers and LLMs, there were <strong>RNNs and LSTMs</strong>, which relied on hidden states leading up to the final predicted token. Training an RNN looked like: process token 0, produce a hidden state; process token 1, produce a new hidden state; and so on. Each step depends on the previous step's output. RNNs' biggest drawback was their <strong>inability to parallelize</strong>, leaving the GPU underutilized. Even though loss was computed for each step, the training process was inefficient: it can't compute all these hidden states simultaneously, because the inputs to later steps aren't ready yet.</p>

      <div class="diagram-wrap">
        <figure>
<svg id="rnn-svg" viewBox="0 0 1120 490" role="img" aria-label="Interactive diagram of RNN training across two 5-token sentences, the cat sat on it (S1) and a dog ran to me (S2), processed together as a batch of 2. At each timestep, both sentences token feed into one shared, batched hidden state and one shared, batched loss, since both sequences are computed together in the same matrix operation. But each timestep still needs the previous shared hidden state before it can start, so the batch advances one timestep at a time across 5 steps.">
<defs>
  <marker id="rnn-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-ink-soft)"/>
  </marker>
</defs>
<text x="560" y="24" class="lbl" text-anchor="middle">Training an RNN: One Timestep at a Time</text>
<text x="560" y="46" class="sub" text-anchor="middle">S1 = &ldquo;The cat sat on it&rdquo; &middot; S2 = &ldquo;A dog ran to me&rdquo;</text>

<g transform="translate(0,30)">
<text x="40" y="75" class="sub" text-anchor="middle">S1</text>
<text x="40" y="155" class="sub" text-anchor="middle">S2</text>

<g id="rnn-step0" class="rnn-node rnn-pending">
  <rect x="75" y="48" width="110" height="44" rx="10"/>
  <text x="130" y="75" text-anchor="middle" class="rnn-label">The</text>
  <rect x="75" y="128" width="110" height="44" rx="10"/>
  <text x="130" y="155" text-anchor="middle" class="rnn-label">A</text>
  <path d="M 130,92 Q 45,170 130,238" class="rnn-arrow" fill="none" marker-end="url(#rnn-arrowhead)"/>
  <line x1="130" y1="172" x2="130" y2="238" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <circle cx="130" cy="270" r="32"/>
  <text x="130" y="276" text-anchor="middle" class="rnn-label">h₀</text>
  <line x1="130" y1="302" x2="130" y2="350" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <rect x="90" y="350" width="80" height="40" rx="8"/>
  <text x="130" y="375" text-anchor="middle" class="rnn-label">L₀</text>
</g>
<g id="rnn-step1" class="rnn-node rnn-pending">
  <rect x="285" y="48" width="110" height="44" rx="10"/>
  <text x="340" y="75" text-anchor="middle" class="rnn-label">cat</text>
  <rect x="285" y="128" width="110" height="44" rx="10"/>
  <text x="340" y="155" text-anchor="middle" class="rnn-label">dog</text>
  <path d="M 340,92 Q 255,170 340,238" class="rnn-arrow" fill="none" marker-end="url(#rnn-arrowhead)"/>
  <line x1="340" y1="172" x2="340" y2="238" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <circle cx="340" cy="270" r="32"/>
  <text x="340" y="276" text-anchor="middle" class="rnn-label">h₁</text>
  <line x1="340" y1="302" x2="340" y2="350" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <rect x="300" y="350" width="80" height="40" rx="8"/>
  <text x="340" y="375" text-anchor="middle" class="rnn-label">L₁</text>
</g>
<g id="rnn-rec1" class="rnn-node rnn-pending">
  <line x1="162" y1="270" x2="308" y2="270" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
</g>
<g id="rnn-step2" class="rnn-node rnn-pending">
  <rect x="495" y="48" width="110" height="44" rx="10"/>
  <text x="550" y="75" text-anchor="middle" class="rnn-label">sat</text>
  <rect x="495" y="128" width="110" height="44" rx="10"/>
  <text x="550" y="155" text-anchor="middle" class="rnn-label">ran</text>
  <path d="M 550,92 Q 465,170 550,238" class="rnn-arrow" fill="none" marker-end="url(#rnn-arrowhead)"/>
  <line x1="550" y1="172" x2="550" y2="238" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <circle cx="550" cy="270" r="32"/>
  <text x="550" y="276" text-anchor="middle" class="rnn-label">h₂</text>
  <line x1="550" y1="302" x2="550" y2="350" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <rect x="510" y="350" width="80" height="40" rx="8"/>
  <text x="550" y="375" text-anchor="middle" class="rnn-label">L₂</text>
</g>
<g id="rnn-rec2" class="rnn-node rnn-pending">
  <line x1="372" y1="270" x2="518" y2="270" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
</g>
<g id="rnn-step3" class="rnn-node rnn-pending">
  <rect x="705" y="48" width="110" height="44" rx="10"/>
  <text x="760" y="75" text-anchor="middle" class="rnn-label">on</text>
  <rect x="705" y="128" width="110" height="44" rx="10"/>
  <text x="760" y="155" text-anchor="middle" class="rnn-label">to</text>
  <path d="M 760,92 Q 675,170 760,238" class="rnn-arrow" fill="none" marker-end="url(#rnn-arrowhead)"/>
  <line x1="760" y1="172" x2="760" y2="238" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <circle cx="760" cy="270" r="32"/>
  <text x="760" y="276" text-anchor="middle" class="rnn-label">h₃</text>
  <line x1="760" y1="302" x2="760" y2="350" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <rect x="720" y="350" width="80" height="40" rx="8"/>
  <text x="760" y="375" text-anchor="middle" class="rnn-label">L₃</text>
</g>
<g id="rnn-rec3" class="rnn-node rnn-pending">
  <line x1="582" y1="270" x2="728" y2="270" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
</g>
<g id="rnn-step4" class="rnn-node rnn-pending">
  <rect x="915" y="48" width="110" height="44" rx="10"/>
  <text x="970" y="75" text-anchor="middle" class="rnn-label">it</text>
  <rect x="915" y="128" width="110" height="44" rx="10"/>
  <text x="970" y="155" text-anchor="middle" class="rnn-label">me</text>
  <path d="M 970,92 Q 885,170 970,238" class="rnn-arrow" fill="none" marker-end="url(#rnn-arrowhead)"/>
  <line x1="970" y1="172" x2="970" y2="238" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <circle cx="970" cy="270" r="32"/>
  <text x="970" y="276" text-anchor="middle" class="rnn-label">h₄</text>
  <line x1="970" y1="302" x2="970" y2="350" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
  <rect x="930" y="350" width="80" height="40" rx="8"/>
  <text x="970" y="375" text-anchor="middle" class="rnn-label">L₄</text>
</g>
<g id="rnn-rec4" class="rnn-node rnn-pending">
  <line x1="792" y1="270" x2="938" y2="270" class="rnn-arrow" marker-end="url(#rnn-arrowhead)"/>
</g>

<text x="130" y="440" class="sub" text-anchor="middle">t = 0</text>
<text x="340" y="440" class="sub" text-anchor="middle">t = 1</text>
<text x="550" y="440" class="sub" text-anchor="middle">t = 2</text>
<text x="760" y="440" class="sub" text-anchor="middle">t = 3</text>
<text x="970" y="440" class="sub" text-anchor="middle">t = 4</text>
</g>
</svg>
          <div class="rnn-controls">
            <button type="button" id="rnn-replay" class="rnn-btn">&#9654;&#xFE0E; Replay</button>
            <input type="range" id="rnn-slider" min="0" max="4" step="1" value="0"/>
            <span id="rnn-readout" class="sub rnn-readout">step 1 of 5: computing h&#8320; and L&#8320; for both sentences</span>
          </div>
          <figcaption>Fig. 29. Batch of 2 sentences' tokens at a timestep feed into one shared, batched hidden state and one shared, batched loss, since S1 and S2 are computed together in the same matrix operation. But each hidden state still has to wait for the previous one, so the whole batch crawls through 5 timesteps one at a time. Drag the slider or hit replay.</figcaption>
        </figure>
      </div>
      <script>
      (function(){
        var steps = 5;
        var svg = document.getElementById('rnn-svg');
        if (!svg || svg.dataset.wired) return;
        svg.dataset.wired = '1';
        var slider = document.getElementById('rnn-slider');
        var readout = document.getElementById('rnn-readout');
        var replayBtn = document.getElementById('rnn-replay');
        var hiddenLabels = ['h₀','h₁','h₂','h₃','h₄'];
        var lossLabels = ['L₀','L₁','L₂','L₃','L₄'];

        function setClass(el, cls){
          if (!el) return;
          el.classList.remove('rnn-pending','rnn-current','rnn-done');
          el.classList.add(cls);
        }

        function render(v){
          for (var i = 0; i < steps; i++){
            var cls = i < v ? 'rnn-done' : (i === v ? 'rnn-current' : 'rnn-pending');
            setClass(document.getElementById('rnn-step'+i), cls);
            if (i >= 1) setClass(document.getElementById('rnn-rec'+i), cls);
          }
          slider.value = v;
          readout.textContent = 'step ' + (v+1) + ' of ' + steps + ': computing ' + hiddenLabels[v] + ' and ' + lossLabels[v] + ' for both sentences' + (v > 0 ? ', which needs ' + hiddenLabels[v-1] + ' to finish first' : '') + (v < steps-1 ? ', so step ' + (v+2) + ' has to wait' : ', the last step');
        }

        var timer = null;
        function stopAutoplay(){ if (timer){ clearInterval(timer); timer = null; } }
        function playFrom(start){
          stopAutoplay();
          var i = start;
          render(i);
          timer = setInterval(function(){
            i++;
            if (i >= steps){ stopAutoplay(); return; }
            render(i);
          }, 900);
        }

        slider.addEventListener('pointerdown', stopAutoplay);
        slider.addEventListener('input', function(){ stopAutoplay(); render(parseInt(slider.value, 10)); });
        replayBtn.addEventListener('click', function(){ playFrom(0); });

        render(0);

        if ('IntersectionObserver' in window){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
              if (entry.isIntersecting){ playFrom(0); io.disconnect(); }
            });
          }, { threshold: 0.4 });
          io.observe(svg);
        } else {
          playFrom(0);
        }
      })();
      </script>
      <style>
        .rnn-controls{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:8px; font-family:'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; }
        .rnn-btn{ font-family:inherit; font-size:12.5px; font-weight:700; color:var(--d-ink); background:var(--d-paper); border:1.5px solid var(--d-teal); border-radius:6px; padding:4px 10px; cursor:pointer; }
        .rnn-btn:hover{ background:var(--d-container-bg); }
        #rnn-slider{ flex:1 1 160px; min-width:120px; accent-color:var(--d-teal-strong); }
        .rnn-readout{ white-space:nowrap; }
        #rnn-svg rect, #rnn-svg circle, #rnn-svg path { transition: fill .2s ease, stroke .2s ease, opacity .2s ease; }
        #rnn-svg .rnn-pending rect, #rnn-svg .rnn-pending circle { fill: var(--d-paper); stroke: var(--d-ink-soft); stroke-dasharray: 4 4; opacity: .45; }
        #rnn-svg .rnn-pending text { opacity: .4; }
        #rnn-svg .rnn-pending line, #rnn-svg .rnn-pending path { opacity: .25; stroke: var(--d-ink-soft); stroke-dasharray: 3 3; }
        #rnn-svg .rnn-current rect, #rnn-svg .rnn-current circle { fill: var(--d-paper); stroke: var(--d-red); stroke-width: 3; opacity: 1; }
        #rnn-svg .rnn-current text { opacity: 1; font-weight: 700; }
        #rnn-svg .rnn-current line, #rnn-svg .rnn-current path { opacity: 1; stroke: var(--d-red); }
        #rnn-svg .rnn-done rect, #rnn-svg .rnn-done circle { fill: var(--d-teal); fill-opacity: .18; stroke: var(--d-teal-strong); stroke-width: 2; opacity: 1; }
        #rnn-svg .rnn-done text { opacity: 1; }
        #rnn-svg .rnn-done line, #rnn-svg .rnn-done path { opacity: 1; stroke: var(--d-teal-strong); }
        #rnn-svg text.rnn-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 14px; fill: var(--d-ink); }
      </style>
      <p style="margin-top: 1.2rem;">The above interaction shows the training of a 1-layer RNN. At each timestep, the RNN requires the old hidden state and the token at time <code>t</code> to predict the next token, updating the hidden state. So even though we've parallelized the tokens in a batch to go through the RNN cell and update hidden states for the entire batch <code>[h<sub>t,0</sub>, h<sub>t,1</sub>, ... h<sub>t,n</sub>]</code> (where <code>t</code> is the timestep and <code>n</code> is the batch element index), the next column, the next timestep, can't begin processing until the computations for its last timestep are done. This dependency is what makes it slower to train.</p>
      <p>Transformers and their self-attention mechanism allow a token to look at other tokens in the context. The current token being predicted can attend and look at all past tokens via its attention op, no hidden states, no waiting on the last token to be generated.</p>

      <div class="diagram-wrap">
        <figure>
<svg id="attn-arc-svg" viewBox="0 0 1080 210" role="img" aria-label="Interactive diagram of self-attention over the sentence The cat sat on it. A slider selects which token is currently being predicted; arrows fan out directly from that token back to every earlier token (and itself), all appearing at once, showing that attention needs no chain of hidden states and no waiting on previous timesteps, unlike the RNN diagram above.">
<defs>
  <marker id="attn-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
</defs>
<text x="540" y="24" class="lbl" text-anchor="middle">Self-Attention: No Waiting, Look Straight Back</text>

<g id="attn-tok0" class="attn-tok attn-masked">
  <rect x="65" y="68" width="150" height="44" rx="10"/>
  <text x="140" y="95" text-anchor="middle" class="rnn-label">The</text>
</g>
<g id="attn-tok1" class="attn-tok attn-masked">
  <rect x="265" y="68" width="150" height="44" rx="10"/>
  <text x="340" y="95" text-anchor="middle" class="rnn-label">cat</text>
</g>
<g id="attn-tok2" class="attn-tok attn-masked">
  <rect x="465" y="68" width="150" height="44" rx="10"/>
  <text x="540" y="95" text-anchor="middle" class="rnn-label">sat</text>
</g>
<g id="attn-tok3" class="attn-tok attn-masked">
  <rect x="665" y="68" width="150" height="44" rx="10"/>
  <text x="740" y="95" text-anchor="middle" class="rnn-label">on</text>
</g>
<g id="attn-tok4" class="attn-tok attn-masked">
  <rect x="865" y="68" width="150" height="44" rx="10"/>
  <text x="940" y="95" text-anchor="middle" class="rnn-label">it</text>
</g>

<path id="attn-arc-1-0" d="M 340,112 Q 240,177 140,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-2-0" d="M 540,112 Q 340,202 140,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-2-1" d="M 540,112 Q 440,177 340,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-3-0" d="M 740,112 Q 440,227 140,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-3-1" d="M 740,112 Q 540,202 340,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-3-2" d="M 740,112 Q 640,177 540,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-4-0" d="M 940,112 Q 540,252 140,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-4-1" d="M 940,112 Q 640,227 340,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-4-2" d="M 940,112 Q 740,202 540,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
<path id="attn-arc-4-3" d="M 940,112 Q 840,177 740,112" class="attn-arc" fill="none" marker-end="url(#attn-arrowhead)"/>
</svg>
          <div class="rnn-controls">
            <button type="button" id="attn-replay" class="rnn-btn">&#9654;&#xFE0E; Replay</button>
            <input type="range" id="attn-slider" min="0" max="4" step="1" value="0"/>
            <span id="attn-readout" class="sub rnn-readout">predicting &ldquo;The&rdquo; (token 0): attends only to itself, nothing came before it</span>
          </div>
          <figcaption>Fig. 30. Drag the slider to move the currently-predicted token. All its arrows to every earlier token (plus itself) appear at once, no chain of hidden states to wait on, unlike the RNN above.</figcaption>
        </figure>
      </div>
      <script>
      (function(){
        var n = 5;
        var tokens = ['The','cat','sat','on','it'];
        var svg = document.getElementById('attn-arc-svg');
        if (!svg || svg.dataset.wired) return;
        svg.dataset.wired = '1';
        var slider = document.getElementById('attn-slider');
        var readout = document.getElementById('attn-readout');
        var replayBtn = document.getElementById('attn-replay');

        function render(i){
          for (var k = 0; k < n; k++){
            var tok = document.getElementById('attn-tok'+k);
            if (!tok) continue;
            tok.classList.remove('attn-masked','attn-attended','attn-current');
            if (k === i) tok.classList.add('attn-current');
            else if (k < i) tok.classList.add('attn-attended');
            else tok.classList.add('attn-masked');
          }
          for (var a = 0; a < n; a++){
            for (var b = 0; b < a; b++){
              var arc = document.getElementById('attn-arc-'+a+'-'+b);
              if (!arc) continue;
              arc.style.display = (a === i) ? '' : 'none';
            }
          }
          slider.value = i;
          readout.textContent = i === 0
            ? 'predicting “' + tokens[0] + '” (token 0): attends only to itself, nothing came before it'
            : 'predicting “' + tokens[i] + '” (token ' + i + '): attends directly to all ' + (i+1) + ' earlier positions (0..' + i + ') at once, no waiting on a chain of hidden states';
        }

        var timer = null;
        function stopAutoplay(){ if (timer){ clearInterval(timer); timer = null; } }
        function playFrom(start){
          stopAutoplay();
          var i = start;
          render(i);
          timer = setInterval(function(){
            i++;
            if (i >= n){ stopAutoplay(); return; }
            render(i);
          }, 900);
        }

        slider.addEventListener('pointerdown', stopAutoplay);
        slider.addEventListener('input', function(){ stopAutoplay(); render(parseInt(slider.value, 10)); });
        replayBtn.addEventListener('click', function(){ playFrom(0); });

        render(0);

        if ('IntersectionObserver' in window){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
              if (entry.isIntersecting){ playFrom(0); io.disconnect(); }
            });
          }, { threshold: 0.4 });
          io.observe(svg);
        } else {
          playFrom(0);
        }
      })();
      </script>
      <style>
        #attn-arc-svg rect { transition: fill .2s ease, stroke .2s ease, opacity .2s ease; }
        #attn-arc-svg .attn-masked rect { fill: var(--d-paper); stroke: var(--d-ink-soft); stroke-dasharray: 4 4; opacity: .45; }
        #attn-arc-svg .attn-masked text { opacity: .4; }
        #attn-arc-svg .attn-attended rect { fill: var(--d-teal); fill-opacity: .18; stroke: var(--d-teal-strong); stroke-width: 2; opacity: 1; }
        #attn-arc-svg .attn-attended text { opacity: 1; }
        #attn-arc-svg .attn-current rect { fill: var(--d-paper); stroke: var(--d-red); stroke-width: 3; opacity: 1; }
        #attn-arc-svg .attn-current text { opacity: 1; font-weight: 700; }
        #attn-arc-svg .attn-arc { stroke: var(--d-red); stroke-width: 2.2; opacity: .85; }
      </style>

      <p style="margin-top: 1.2rem;">Transformers train for autoregressive decoding by feeding it a sentence and asking it to predict the next token at each token step.</p>

      <div class="diagram-wrap">
        <figure>
<svg id="seq-arrow-svg" viewBox="0 0 1080 185" role="img" aria-label="Interactive diagram of autoregressive training over the sentence The cat sat on it. A slider moves through each step: the input span (highlighted) grows one token at a time from the start of the sentence, while the very next token (highlighted differently) is the target being predicted, with all later tokens greyed out. A curly brace under the input span groups the input tokens, and an arrow moves from the end of the input span to the target token at each step.">
<defs>
  <marker id="seq-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
</defs>
<text x="540" y="18" class="lbl" text-anchor="middle">Autoregressive Training: Input Grows, Target Moves Forward</text>

<path id="seq-arrow" d="M 140,70 Q 240,30 340,70" fill="none" stroke="var(--d-red)" stroke-width="2.2" marker-end="url(#seq-arrowhead)"/>

<path id="seq-brace" d="M 65,122 Q 65,136 83,136 L 122,136 Q 140,136 140,148 Q 140,136 158,136 L 197,136 Q 215,136 215,122" fill="none" stroke="var(--d-teal-strong)" stroke-width="2"/>
<text id="seq-brace-label" x="140" y="166" text-anchor="middle" class="sub">input</text>

<g id="seq-tok0" class="seq-tok seq-input">
  <rect x="65" y="70" width="150" height="44" rx="10"/>
  <text x="140" y="97" text-anchor="middle" class="rnn-label">The</text>
</g>
<g id="seq-tok1" class="seq-tok seq-target">
  <rect x="265" y="70" width="150" height="44" rx="10"/>
  <text x="340" y="97" text-anchor="middle" class="rnn-label">cat</text>
</g>
<g id="seq-tok2" class="seq-tok seq-hidden">
  <rect x="465" y="70" width="150" height="44" rx="10"/>
  <text x="540" y="97" text-anchor="middle" class="rnn-label">sat</text>
</g>
<g id="seq-tok3" class="seq-tok seq-hidden">
  <rect x="665" y="70" width="150" height="44" rx="10"/>
  <text x="740" y="97" text-anchor="middle" class="rnn-label">on</text>
</g>
<g id="seq-tok4" class="seq-tok seq-hidden">
  <rect x="865" y="70" width="150" height="44" rx="10"/>
  <text x="940" y="97" text-anchor="middle" class="rnn-label">it</text>
</g>
</svg>
          <div class="rnn-controls">
            <button type="button" id="seq-replay" class="rnn-btn">&#9654;&#xFE0E; Replay</button>
            <input type="range" id="seq-slider" min="0" max="3" step="1" value="0"/>
            <span id="seq-readout" class="sub rnn-readout">input = &ldquo;The&rdquo; (1 token), predict &ldquo;cat&rdquo;</span>
          </div>
          <figcaption>Fig. 31. Drag the slider: the input span (teal) grows one token at a time, the target right after it (red) moves forward one token at a time, and everything past the target stays greyed out because it hasn't been fed in yet. All 4 of these input/target pairs are actually scored together in a single parallel forward pass, not one at a time.</figcaption>
        </figure>
      </div>
      <script>
      (function(){
        var n = 5;
        var xs = [140, 340, 540, 740, 940];
        var tokens = ['The','cat','sat','on','it'];
        var svg = document.getElementById('seq-arrow-svg');
        if (!svg || svg.dataset.wired) return;
        svg.dataset.wired = '1';
        var slider = document.getElementById('seq-slider');
        var readout = document.getElementById('seq-readout');
        var replayBtn = document.getElementById('seq-replay');
        var arrow = document.getElementById('seq-arrow');
        var brace = document.getElementById('seq-brace');
        var braceLabel = document.getElementById('seq-brace-label');

        function bracePath(left, right, y, d, t){
          var mid = (left + right) / 2;
          var r = Math.min(18, (right - left) / 2 - 2);
          return 'M ' + left + ',' + y +
            ' Q ' + left + ',' + (y+d) + ' ' + (left+r) + ',' + (y+d) +
            ' L ' + (mid-r) + ',' + (y+d) +
            ' Q ' + mid + ',' + (y+d) + ' ' + mid + ',' + (y+d+t) +
            ' Q ' + mid + ',' + (y+d) + ' ' + (mid+r) + ',' + (y+d) +
            ' L ' + (right-r) + ',' + (y+d) +
            ' Q ' + right + ',' + (y+d) + ' ' + right + ',' + y;
        }

        function render(i){
          for (var k = 0; k < n; k++){
            var tok = document.getElementById('seq-tok'+k);
            if (!tok) continue;
            tok.classList.remove('seq-input','seq-target','seq-hidden');
            if (k <= i) tok.classList.add('seq-input');
            else if (k === i+1) tok.classList.add('seq-target');
            else tok.classList.add('seq-hidden');
          }
          var x0 = xs[i], x1 = xs[i+1], mid = (x0+x1)/2;
          arrow.setAttribute('d', 'M ' + x0 + ',70 Q ' + mid + ',30 ' + x1 + ',70');
          var braceLeft = xs[0] - 75, braceRight = xs[i] + 75;
          brace.setAttribute('d', bracePath(braceLeft, braceRight, 122, 14, 12));
          braceLabel.setAttribute('x', (braceLeft + braceRight) / 2);
          slider.value = i;
          readout.textContent = 'input = tokens[0..' + i + '] (' + (i+1) + ' token' + (i > 0 ? 's' : '') + '), predict “' + tokens[i+1] + '”';
        }

        var timer = null;
        function stopAutoplay(){ if (timer){ clearInterval(timer); timer = null; } }
        function playFrom(start){
          stopAutoplay();
          var i = start;
          render(i);
          timer = setInterval(function(){
            i++;
            if (i > n-2){ stopAutoplay(); return; }
            render(i);
          }, 900);
        }

        slider.addEventListener('pointerdown', stopAutoplay);
        slider.addEventListener('input', function(){ stopAutoplay(); render(parseInt(slider.value, 10)); });
        replayBtn.addEventListener('click', function(){ playFrom(0); });

        render(0);

        if ('IntersectionObserver' in window){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
              if (entry.isIntersecting){ playFrom(0); io.disconnect(); }
            });
          }, { threshold: 0.4 });
          io.observe(svg);
        } else {
          playFrom(0);
        }
      })();
      </script>
      <style>
        #seq-arrow-svg rect { transition: fill .2s ease, stroke .2s ease, opacity .2s ease; }
        #seq-arrow-svg .seq-hidden rect { fill: var(--d-paper); stroke: var(--d-ink-soft); stroke-dasharray: 4 4; opacity: .45; }
        #seq-arrow-svg .seq-hidden text { opacity: .4; }
        #seq-arrow-svg .seq-input rect { fill: var(--d-teal); fill-opacity: .18; stroke: var(--d-teal-strong); stroke-width: 2; opacity: 1; }
        #seq-arrow-svg .seq-input text { opacity: 1; }
        #seq-arrow-svg .seq-target rect { fill: var(--d-paper); stroke: var(--d-red); stroke-width: 3; opacity: 1; }
        #seq-arrow-svg .seq-target text { opacity: 1; font-weight: 700; }
      </style>

      <p style="margin-top: 1.2rem;">Transformers allow parallelism at each token step, so all tokens can produce the next token efficiently in one forward pass rather than sequentially like in RNNs. All token steps produce a loss after one forward pass.</p>

      <div class="diagram-wrap">
        <figure>
          <div class="rnn-controls" style="margin: 0 0 .8rem;">
            <button type="button" id="qk-mask-toggle" class="rnn-btn">Mask: OFF (bidirectional)</button>
            <span class="sub rnn-readout">Toggle to see attention without causal masking.<br>Hover a predicted token to see which input row produced it.</span>
          </div>
<svg id="qk-matrix-svg" viewBox="0 0 860 420" role="img" aria-label="Interactive 5 by 5 attention score matrix for the sentence The cat sat on it, query tokens as rows, key tokens as columns, with a toggle for causal masking. V is drawn as a single contiguous block spanning all 5 rows, labeled V0 through V4. The score matrix, V, and the predicted-token boxes each show a dashed corner, peeking from the top and right, labeled B, representing the batch dimension: additional sentences processed in parallel. Each row is multiplied with V to predict the next token, shown next to the shifted-sentence target word for that row and its loss value L0 through L4. Hovering or focusing a predicted token highlights the input row it came from.">
<defs>
  <marker id="qk-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-ink-soft)"/>
  </marker>
</defs>
<path d="M 96,54 L 396,54 L 396,354" class="batch-ghost" fill="none"/>
<path d="M 88,62 L 388,62 L 388,362" class="batch-ghost" fill="none"/>
<path d="M 436,54 L 492,54 L 492,354" class="batch-ghost" fill="none"/>
<path d="M 428,62 L 484,62 L 484,362" class="batch-ghost" fill="none"/>
<text x="230" y="20" class="lbl" text-anchor="middle">key</text>
<text x="18" y="220" class="lbl" text-anchor="middle" transform="rotate(-90 18 220)">query</text>
<text x="110" y="50" class="sub" text-anchor="middle">The</text>
<text x="170" y="50" class="sub" text-anchor="middle">cat</text>
<text x="230" y="50" class="sub" text-anchor="middle">sat</text>
<text x="290" y="50" class="sub" text-anchor="middle">on</text>
<text x="350" y="50" class="sub" text-anchor="middle">it</text>
<text x="448" y="46" class="sub" text-anchor="middle">V</text>
<text x="565" y="46" class="sub" text-anchor="middle">predict</text>
<text x="690" y="46" class="sub" text-anchor="middle">target</text>
<text x="754" y="46" class="sub" text-anchor="start">loss</text>
<text x="400" y="228" class="lbl" text-anchor="middle" style="font-size:22px;">&times;</text>
<g class="qk-vcol">
  <rect x="420" y="70" width="56" height="300" rx="6"/>
  <line x1="420" y1="130" x2="476" y2="130" class="qk-vdiv"/>
  <line x1="420" y1="190" x2="476" y2="190" class="qk-vdiv"/>
  <line x1="420" y1="250" x2="476" y2="250" class="qk-vdiv"/>
  <line x1="420" y1="310" x2="476" y2="310" class="qk-vdiv"/>
  <text x="448" y="105" text-anchor="middle" class="qk-vz-text">V<tspan baseline-shift="sub" font-size="9">0</tspan></text>
  <text x="448" y="165" text-anchor="middle" class="qk-vz-text">V<tspan baseline-shift="sub" font-size="9">1</tspan></text>
  <text x="448" y="225" text-anchor="middle" class="qk-vz-text">V<tspan baseline-shift="sub" font-size="9">2</tspan></text>
  <text x="448" y="285" text-anchor="middle" class="qk-vz-text">V<tspan baseline-shift="sub" font-size="9">3</tspan></text>
  <text x="448" y="345" text-anchor="middle" class="qk-vz-text">V<tspan baseline-shift="sub" font-size="9">4</tspan></text>
</g>
<g id="qkrow0" class="qk-row">
  <text id="qklabel0" x="68" y="105" class="sub qk-input-label" text-anchor="end">The</text>
  <g class="qk-cell" data-masked="1.00" data-unmasked="0.35">
    <rect x="80" y="70" width="60" height="60"/>
    <text x="110" y="105" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.25">
    <rect x="140" y="70" width="60" height="60"/>
    <text x="170" y="105" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.15">
    <rect x="200" y="70" width="60" height="60"/>
    <text x="230" y="105" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.15">
    <rect x="260" y="70" width="60" height="60"/>
    <text x="290" y="105" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.10">
    <rect x="320" y="70" width="60" height="60"/>
    <text x="350" y="105" text-anchor="middle"></text>
  </g>
  <line x1="476" y1="100" x2="520" y2="100" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
  <path d="M 536,58 L 626,58 L 626,126" class="batch-ghost" fill="none"/>
  <path d="M 528,66 L 618,66 L 618,126" class="batch-ghost" fill="none"/>
  <g id="qkpred0" class="qk-pred" data-row="0" tabindex="0" role="button">
    <rect x="520" y="74" width="90" height="52" rx="6"/>
    <text x="565" y="105" text-anchor="middle"></text>
  </g>
  <line x1="610" y1="100" x2="650" y2="100" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
<path d="M 666,58 L 746,58 L 746,126" class="batch-ghost" fill="none"/>
<path d="M 658,66 L 738,66 L 738,126" class="batch-ghost" fill="none"/>
<g class="qk-target-box">
  <rect x="650" y="74" width="80" height="52" rx="6"/>
  <text x="690" y="105" text-anchor="middle" class="qk-target-text">cat</text>
</g>
<text id="qkloss0" x="754" y="105" text-anchor="start" class="qk-loss-text"></text>
</g>
<g id="qkrow1" class="qk-row">
  <text id="qklabel1" x="68" y="165" class="sub qk-input-label" text-anchor="end">cat</text>
  <g class="qk-cell" data-masked="0.30" data-unmasked="0.22">
    <rect x="80" y="130" width="60" height="60"/>
    <text x="110" y="165" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.70" data-unmasked="0.48">
    <rect x="140" y="130" width="60" height="60"/>
    <text x="170" y="165" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.12">
    <rect x="200" y="130" width="60" height="60"/>
    <text x="230" y="165" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.10">
    <rect x="260" y="130" width="60" height="60"/>
    <text x="290" y="165" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.08">
    <rect x="320" y="130" width="60" height="60"/>
    <text x="350" y="165" text-anchor="middle"></text>
  </g>
  <line x1="476" y1="160" x2="520" y2="160" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
  <line x1="626" y1="134" x2="626" y2="186" class="batch-ghost"/>
  <line x1="618" y1="134" x2="618" y2="186" class="batch-ghost"/>
  <g id="qkpred1" class="qk-pred" data-row="1" tabindex="0" role="button">
    <rect x="520" y="134" width="90" height="52" rx="6"/>
    <text x="565" y="165" text-anchor="middle"></text>
  </g>
  <line x1="610" y1="160" x2="650" y2="160" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
<line x1="746" y1="134" x2="746" y2="186" class="batch-ghost"/>
<line x1="738" y1="134" x2="738" y2="186" class="batch-ghost"/>
<g class="qk-target-box">
  <rect x="650" y="134" width="80" height="52" rx="6"/>
  <text x="690" y="165" text-anchor="middle" class="qk-target-text">sat</text>
</g>
<text id="qkloss1" x="754" y="165" text-anchor="start" class="qk-loss-text"></text>
</g>
<g id="qkrow2" class="qk-row">
  <text id="qklabel2" x="68" y="225" class="sub qk-input-label" text-anchor="end">sat</text>
  <g class="qk-cell" data-masked="0.20" data-unmasked="0.15">
    <rect x="80" y="190" width="60" height="60"/>
    <text x="110" y="225" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.30" data-unmasked="0.20">
    <rect x="140" y="190" width="60" height="60"/>
    <text x="170" y="225" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.50" data-unmasked="0.35">
    <rect x="200" y="190" width="60" height="60"/>
    <text x="230" y="225" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.20">
    <rect x="260" y="190" width="60" height="60"/>
    <text x="290" y="225" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.10">
    <rect x="320" y="190" width="60" height="60"/>
    <text x="350" y="225" text-anchor="middle"></text>
  </g>
  <line x1="476" y1="220" x2="520" y2="220" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
  <line x1="626" y1="194" x2="626" y2="246" class="batch-ghost"/>
  <line x1="618" y1="194" x2="618" y2="246" class="batch-ghost"/>
  <g id="qkpred2" class="qk-pred" data-row="2" tabindex="0" role="button">
    <rect x="520" y="194" width="90" height="52" rx="6"/>
    <text x="565" y="225" text-anchor="middle"></text>
  </g>
  <line x1="610" y1="220" x2="650" y2="220" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
<line x1="746" y1="194" x2="746" y2="246" class="batch-ghost"/>
<line x1="738" y1="194" x2="738" y2="246" class="batch-ghost"/>
<g class="qk-target-box">
  <rect x="650" y="194" width="80" height="52" rx="6"/>
  <text x="690" y="225" text-anchor="middle" class="qk-target-text">on</text>
</g>
<text id="qkloss2" x="754" y="225" text-anchor="start" class="qk-loss-text"></text>
</g>
<g id="qkrow3" class="qk-row">
  <text id="qklabel3" x="68" y="285" class="sub qk-input-label" text-anchor="end">on</text>
  <g class="qk-cell" data-masked="0.10" data-unmasked="0.08">
    <rect x="80" y="250" width="60" height="60"/>
    <text x="110" y="285" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.20" data-unmasked="0.15">
    <rect x="140" y="250" width="60" height="60"/>
    <text x="170" y="285" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.30" data-unmasked="0.22">
    <rect x="200" y="250" width="60" height="60"/>
    <text x="230" y="285" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.40" data-unmasked="0.35">
    <rect x="260" y="250" width="60" height="60"/>
    <text x="290" y="285" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="" data-unmasked="0.20">
    <rect x="320" y="250" width="60" height="60"/>
    <text x="350" y="285" text-anchor="middle"></text>
  </g>
  <line x1="476" y1="280" x2="520" y2="280" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
  <line x1="626" y1="254" x2="626" y2="306" class="batch-ghost"/>
  <line x1="618" y1="254" x2="618" y2="306" class="batch-ghost"/>
  <g id="qkpred3" class="qk-pred" data-row="3" tabindex="0" role="button">
    <rect x="520" y="254" width="90" height="52" rx="6"/>
    <text x="565" y="285" text-anchor="middle"></text>
  </g>
  <line x1="610" y1="280" x2="650" y2="280" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
<line x1="746" y1="254" x2="746" y2="306" class="batch-ghost"/>
<line x1="738" y1="254" x2="738" y2="306" class="batch-ghost"/>
<g class="qk-target-box">
  <rect x="650" y="254" width="80" height="52" rx="6"/>
  <text x="690" y="285" text-anchor="middle" class="qk-target-text">it</text>
</g>
<text id="qkloss3" x="754" y="285" text-anchor="start" class="qk-loss-text"></text>
</g>
<g id="qkrow4" class="qk-row">
  <text id="qklabel4" x="68" y="345" class="sub qk-input-label" text-anchor="end">it</text>
  <g class="qk-cell" data-masked="0.10" data-unmasked="0.10">
    <rect x="80" y="310" width="60" height="60"/>
    <text x="110" y="345" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.10" data-unmasked="0.10">
    <rect x="140" y="310" width="60" height="60"/>
    <text x="170" y="345" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.20" data-unmasked="0.20">
    <rect x="200" y="310" width="60" height="60"/>
    <text x="230" y="345" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.20" data-unmasked="0.20">
    <rect x="260" y="310" width="60" height="60"/>
    <text x="290" y="345" text-anchor="middle"></text>
  </g>
  <g class="qk-cell" data-masked="0.40" data-unmasked="0.40">
    <rect x="320" y="310" width="60" height="60"/>
    <text x="350" y="345" text-anchor="middle"></text>
  </g>
  <line x1="476" y1="340" x2="520" y2="340" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
  <line x1="626" y1="314" x2="626" y2="366" class="batch-ghost"/>
  <line x1="618" y1="314" x2="618" y2="366" class="batch-ghost"/>
  <g id="qkpred4" class="qk-pred" data-row="4" tabindex="0" role="button">
    <rect x="520" y="314" width="90" height="52" rx="6"/>
    <text x="565" y="345" text-anchor="middle"></text>
  </g>
  <line x1="610" y1="340" x2="650" y2="340" class="qk-pipe-arrow" marker-end="url(#qk-arrowhead)"/>
<line x1="746" y1="314" x2="746" y2="366" class="batch-ghost"/>
<line x1="738" y1="314" x2="738" y2="366" class="batch-ghost"/>
<g class="qk-target-box">
  <rect x="650" y="314" width="80" height="52" rx="6"/>
  <text x="690" y="345" text-anchor="middle" class="qk-target-text">.</text>
</g>
<text id="qkloss4" x="754" y="345" text-anchor="start" class="qk-loss-text"></text>
</g>
</svg>
          <table class="qk-summary sub">
            <tr><td class="qk-summary-label">inputs:</td><td>The</td><td>cat</td><td>sat</td><td>on</td><td>it</td></tr>
            <tr><td class="qk-summary-label">targets:</td><td>cat</td><td>sat</td><td>on</td><td>it</td><td>.</td></tr>
            <tr><td class="qk-summary-label">predictions:</td><td id="qk-summary-pred0">cat</td><td id="qk-summary-pred1">sat</td><td id="qk-summary-pred2">on</td><td id="qk-summary-pred3">it</td><td id="qk-summary-pred4">.</td></tr>
          </table>
          <figcaption>Fig. 32. Interactive attention score matrix (togglable causal mask) for next-token prediction.</figcaption>
        </figure>
      </div>
      <script>
      (function(){
        var svg = document.getElementById('qk-matrix-svg');
        if (!svg || svg.dataset.wired) return;
        svg.dataset.wired = '1';
        var maskBtn = document.getElementById('qk-mask-toggle');
        var cells = svg.querySelectorAll('.qk-cell');
        var preds = svg.querySelectorAll('.qk-pred');
        var maskOn = false;
        var activeRow = null;
        var predictions = {
          masked: [
            {word:'cat', correct:true, loss:0.12},
            {word:'sat', correct:true, loss:0.18},
            {word:'there', correct:false, loss:2.35},
            {word:'it', correct:true, loss:0.09},
            {word:',', correct:false, loss:1.87}
          ],
          unmasked: [
            {word:'cat', correct:true, loss:0.08},
            {word:'sat', correct:true, loss:0.11},
            {word:'on', correct:true, loss:0.14},
            {word:'it', correct:true, loss:0.07},
            {word:'.', correct:true, loss:0.10}
          ]
        };

        function paintPredictions(){
          var set = maskOn ? predictions.masked : predictions.unmasked;
          for (var i = 0; i < 5; i++){
            var p = set[i];
            var predEl = document.getElementById('qkpred'+i);
            var lossEl = document.getElementById('qkloss'+i);
            if (!predEl) continue;
            var textEl = predEl.querySelector('text');
            predEl.classList.remove('heat-pred-correct','heat-pred-wrong');
            predEl.classList.add(p.correct ? 'heat-pred-correct' : 'heat-pred-wrong');
            textEl.textContent = p.word + ' ' + (p.correct ? '✓' : '✗');
            if (lossEl){
              lossEl.textContent = 'L' + i + ' = ' + p.loss.toFixed(2);
              lossEl.classList.remove('qk-loss-correct','qk-loss-wrong');
              lossEl.classList.add(p.correct ? 'qk-loss-correct' : 'qk-loss-wrong');
            }
          }
          for (var s = 0; s < 5; s++){
            var summaryCell = document.getElementById('qk-summary-pred'+s);
            if (!summaryCell) continue;
            summaryCell.textContent = set[s].word;
            summaryCell.classList.remove('qk-loss-correct','qk-loss-wrong');
            summaryCell.classList.add(set[s].correct ? 'qk-loss-correct' : 'qk-loss-wrong');
          }
        }

        function paintCell(cellEl){
          var maskedAttr = cellEl.getAttribute('data-masked');
          var unmaskedVal = parseFloat(cellEl.getAttribute('data-unmasked'));
          var rect = cellEl.querySelector('rect');
          var text = cellEl.querySelector('text');
          var isMaskedBlank = maskOn && maskedAttr === '';
          if (isMaskedBlank){
            rect.setAttribute('fill', 'var(--d-rule)');
            rect.setAttribute('fill-opacity', '0.5');
            rect.setAttribute('stroke', 'var(--d-teal)');
            rect.setAttribute('stroke-opacity', '0.3');
            rect.setAttribute('stroke-dasharray', '3 3');
            rect.removeAttribute('stroke-width');
            text.textContent = '';
            text.removeAttribute('class');
          } else {
            var v = maskOn ? parseFloat(maskedAttr) : unmaskedVal;
            rect.setAttribute('fill', 'var(--d-teal-strong)');
            rect.setAttribute('fill-opacity', v.toFixed(2));
            rect.setAttribute('stroke', 'var(--d-rule)');
            rect.setAttribute('stroke-width', '1');
            rect.removeAttribute('stroke-dasharray');
            rect.removeAttribute('stroke-opacity');
            text.textContent = v.toFixed(2);
            text.setAttribute('class', v >= 0.4 ? 'heat-light' : 'heat-dark');
          }
        }

        function applyMask(){
          for (var i = 0; i < cells.length; i++){ paintCell(cells[i]); }
          paintPredictions();
          maskBtn.textContent = maskOn ? 'Mask: ON (causal)' : 'Mask: OFF (bidirectional)';
          if (activeRow !== null) highlightRow(activeRow);
        }

        function clearHighlight(){
          for (var i = 0; i < 5; i++){
            var row = document.getElementById('qkrow'+i);
            if (row) {
              row.classList.remove('row-active','row-dim');
              var cellEls = row.querySelectorAll('.qk-cell');
              for (var c = 0; c < cellEls.length; c++){ cellEls[c].classList.remove('cell-input-highlight'); }
            }
            var label = document.getElementById('qklabel'+i);
            if (label) label.classList.remove('input-active');
          }
          activeRow = null;
        }

        function highlightRow(idx){
          for (var i = 0; i < 5; i++){
            var row = document.getElementById('qkrow'+i);
            var label = document.getElementById('qklabel'+i);
            if (row) {
              row.classList.remove('row-active','row-dim');
              row.classList.add(i === idx ? 'row-active' : 'row-dim');
              var cellEls = row.querySelectorAll('.qk-cell');
              for (var c = 0; c < cellEls.length; c++){
                var isInput = (i === idx) && (c <= idx);
                cellEls[c].classList.toggle('cell-input-highlight', isInput);
              }
            }
            if (label) label.classList.toggle('input-active', i === idx);
          }
          activeRow = idx;
        }

        maskBtn.addEventListener('click', function(){
          maskOn = !maskOn;
          applyMask();
        });

        for (var p = 0; p < preds.length; p++){
          (function(predEl){
            var row = parseInt(predEl.getAttribute('data-row'), 10);
            predEl.addEventListener('mouseenter', function(){ highlightRow(row); });
            predEl.addEventListener('mouseleave', function(){ clearHighlight(); });
            predEl.addEventListener('focus', function(){ highlightRow(row); });
            predEl.addEventListener('blur', function(){ clearHighlight(); });
          })(preds[p]);
        }

        applyMask();
      })();
      </script>
      <style>
        #qk-matrix-svg .qk-row { transition: opacity .25s ease; }
        #qk-matrix-svg .qk-row.row-dim { opacity: .25; }
        #qk-matrix-svg .qk-row.row-active { opacity: 1; }
        #qk-matrix-svg .qk-pred { cursor: pointer; }
        #qk-matrix-svg .qk-pred:focus rect { outline: 2px solid var(--d-teal-strong); outline-offset: 2px; }
        #qk-matrix-svg .qk-pipe-arrow { stroke: var(--d-ink-soft); stroke-width: 1.6; }
        #qk-matrix-svg .qk-vcol rect { fill: var(--d-container-bg); stroke: var(--d-teal); stroke-width: 1.6; }
        #qk-matrix-svg .qk-vdiv { stroke: var(--d-teal); stroke-opacity: .35; stroke-width: 1; }
        #qk-matrix-svg .qk-vz-text { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 14px; font-weight: 700; fill: var(--d-ink); }
        #qk-matrix-svg .batch-ghost { fill: none; stroke: var(--d-ink-soft); stroke-width: 1.6; stroke-dasharray: 5 4; opacity: .5; }
        #qk-matrix-svg .batch-ghost-label { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; font-weight: 700; fill: var(--d-ink-soft); }
        #qk-matrix-svg .qk-target-box rect { fill: var(--d-container-bg); stroke: var(--d-teal); stroke-width: 1.6; }
        #qk-matrix-svg .qk-target-text { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 13px; font-weight: 700; fill: var(--d-ink); }
        #qk-matrix-svg .qk-loss-text { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; font-weight: 700; }
        #qk-matrix-svg .qk-loss-text.qk-loss-correct { fill: var(--d-teal-strong); }
        #qk-matrix-svg .qk-loss-text.qk-loss-wrong { fill: var(--d-red); }
        #qk-matrix-svg .qk-input-label { transition: fill .2s ease, font-weight .2s ease; }
        #qk-matrix-svg .qk-input-label.input-active { fill: var(--d-red); font-weight: 700; font-size: 13px; }
        #qk-matrix-svg .qk-cell rect { transition: stroke .2s ease, stroke-width .2s ease; }
        #qk-matrix-svg .qk-cell.cell-input-highlight rect { stroke: var(--d-red); stroke-width: 3; }
        .qk-summary { font-family: 'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; margin-top: .8rem; border-collapse: collapse; }
        .qk-summary td { padding: .15rem .9rem .15rem 0; font-weight: 700; color: var(--d-ink); white-space: nowrap; }
        .qk-summary td.qk-summary-label { font-weight: 400; color: var(--d-ink-soft); padding-right: .6rem; }
        .qk-summary td.qk-loss-correct { color: var(--d-teal-strong); }
        .qk-summary td.qk-loss-wrong { color: var(--d-red); }
        .s4-flow-arrow { stroke: var(--d-red); stroke-width: 2.6; }
      </style>

      <p style="margin-top: 1.2rem;">Since we're training for next-token prediction, <strong>targets are inputs shifted by one token</strong>, shown above. With 5 input tokens, we predict at all 5 positions at once. With the mask off, <em>cat</em>'s query attends over the whole sentence, including &ldquo;sat&rdquo;, &ldquo;on&rdquo;, and &ldquo;it&rdquo;, the tokens it's supposed to predict. That's not prediction, it's reading the answer during the attention op.</p>
      <p>The <strong>causal mask</strong> stops this. Position <code>i</code> can only attend to itself and earlier positions, never <code>i+1</code> or beyond. With the mask on, &ldquo;cat&rdquo; sees only &ldquo;The&rdquo; and itself, so it has to make educated guesses rather than peek ahead, which is what forces the model to actually learn.</p>
      <p>The mask works directly on the raw dot products: it sets every future-token score to <code>-&infin;</code>, so once softmax runs, those positions get exactly zero weight.</p>

      <div class="diagram-wrap">
        <figure>
<svg viewBox="0 0 1100 320" role="img" aria-label="Four 5 by 5 matrices showing how the causal mask works: raw attention dot-product scores S, colored by magnitude (teal positive, red negative); the mask M, zero on and below the diagonal and negative infinity above it, shown in red; S plus M, where future positions become negative infinity; and the row-wise softmax of S plus M, where every future position becomes exactly zero and only past and current positions carry probability." style="max-width:100%;height:auto;">
<defs>
  <marker id="s4-arrowhead" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
</defs>
<text x="175" y="20" class="lbl" text-anchor="middle" style="font-size:13px;">Raw scores (S)</text>
<text x="83" y="52" class="sub" text-anchor="middle" style="font-size:10px;">The</text>
<text x="129" y="52" class="sub" text-anchor="middle" style="font-size:10px;">cat</text>
<text x="175" y="52" class="sub" text-anchor="middle" style="font-size:10px;">sat</text>
<text x="221" y="52" class="sub" text-anchor="middle" style="font-size:10px;">on</text>
<text x="267" y="52" class="sub" text-anchor="middle" style="font-size:10px;">it</text>
<text x="54" y="87" class="sub" text-anchor="end" style="font-size:10px;">The</text>
<text x="54" y="133" class="sub" text-anchor="end" style="font-size:10px;">cat</text>
<text x="54" y="179" class="sub" text-anchor="end" style="font-size:10px;">sat</text>
<text x="54" y="225" class="sub" text-anchor="end" style="font-size:10px;">on</text>
<text x="54" y="271" class="sub" text-anchor="end" style="font-size:10px;">it</text>
<rect x="60" y="60" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.91" stroke="var(--d-rule)" stroke-width="1"/>
<text x="83" y="87" text-anchor="middle" class="heat-light" style="font-size:11.5px;">2.10</text>
<rect x="106" y="60" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.35" stroke="var(--d-rule)" stroke-width="1"/>
<text x="129" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.80</text>
<rect x="152" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.22" stroke="var(--d-rule)" stroke-width="1"/>
<text x="175" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">-0.50</text>
<rect x="198" y="60" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.52" stroke="var(--d-rule)" stroke-width="1"/>
<text x="221" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">1.20</text>
<rect x="244" y="60" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.13" stroke="var(--d-rule)" stroke-width="1"/>
<text x="267" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.30</text>
<rect x="60" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.65" stroke="var(--d-rule)" stroke-width="1"/>
<text x="83" y="133" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.50</text>
<rect x="106" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="1.00" stroke="var(--d-rule)" stroke-width="1"/>
<text x="129" y="133" text-anchor="middle" class="heat-light" style="font-size:11.5px;">2.30</text>
<rect x="152" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.17" stroke="var(--d-rule)" stroke-width="1"/>
<text x="175" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.40</text>
<rect x="198" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.09" stroke="var(--d-rule)" stroke-width="1"/>
<text x="221" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">-0.20</text>
<rect x="244" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="267" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="60" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.26" stroke="var(--d-rule)" stroke-width="1"/>
<text x="83" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.60</text>
<rect x="106" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="129" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="152" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.78" stroke="var(--d-rule)" stroke-width="1"/>
<text x="175" y="179" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.80</text>
<rect x="198" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.09" stroke="var(--d-rule)" stroke-width="1"/>
<text x="221" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.20</text>
<rect x="244" y="152" width="46" height="46" fill="var(--d-red)" fill-opacity="0.17" stroke="var(--d-rule)" stroke-width="1"/>
<text x="267" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">-0.40</text>
<rect x="60" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.04" stroke="var(--d-rule)" stroke-width="1"/>
<text x="83" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.10</text>
<rect x="106" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.30" stroke="var(--d-rule)" stroke-width="1"/>
<text x="129" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.70</text>
<rect x="152" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.48" stroke="var(--d-rule)" stroke-width="1"/>
<text x="175" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">1.10</text>
<rect x="198" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.70" stroke="var(--d-rule)" stroke-width="1"/>
<text x="221" y="225" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.60</text>
<rect x="244" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.22" stroke="var(--d-rule)" stroke-width="1"/>
<text x="267" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.50</text>
<rect x="60" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.09" stroke="var(--d-rule)" stroke-width="1"/>
<text x="83" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.20</text>
<rect x="106" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.09" stroke="var(--d-rule)" stroke-width="1"/>
<text x="129" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.20</text>
<rect x="152" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="175" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="198" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="221" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="244" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.87" stroke="var(--d-rule)" stroke-width="1"/>
<text x="267" y="271" text-anchor="middle" class="heat-light" style="font-size:11.5px;">2.00</text>
<text x="305" y="183" text-anchor="middle" class="lbl" style="font-size:24px;">+</text>
<text x="435" y="20" class="lbl" text-anchor="middle" style="font-size:13px;">Mask (M)</text>
<rect x="320" y="60" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="343" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="366" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="389" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="412" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="435" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="458" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="481" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="504" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="527" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="320" y="106" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="343" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="366" y="106" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="389" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="412" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="435" y="133" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="458" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="481" y="133" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="504" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="527" y="133" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="320" y="152" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="343" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="366" y="152" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="389" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="412" y="152" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="435" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="458" y="152" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="481" y="179" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="504" y="152" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="527" y="179" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="320" y="198" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="343" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="366" y="198" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="389" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="412" y="198" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="435" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="458" y="198" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="481" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="504" y="198" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="527" y="225" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="320" y="244" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="343" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="366" y="244" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="389" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="412" y="244" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="435" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="458" y="244" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="481" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="504" y="244" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="527" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<line x1="556" y1="175" x2="574" y2="175" class="s4-flow-arrow" marker-end="url(#s4-arrowhead)"/>
<text x="695" y="20" class="lbl" text-anchor="middle" style="font-size:13px;">S + M</text>
<rect x="580" y="60" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.91" stroke="var(--d-rule)" stroke-width="1"/>
<text x="603" y="87" text-anchor="middle" class="heat-light" style="font-size:11.5px;">2.10</text>
<rect x="626" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="649" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="672" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="695" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="718" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="741" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="764" y="60" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="787" y="87" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="580" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.65" stroke="var(--d-rule)" stroke-width="1"/>
<text x="603" y="133" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.50</text>
<rect x="626" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="1.00" stroke="var(--d-rule)" stroke-width="1"/>
<text x="649" y="133" text-anchor="middle" class="heat-light" style="font-size:11.5px;">2.30</text>
<rect x="672" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="695" y="133" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="718" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="741" y="133" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="764" y="106" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="787" y="133" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="580" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.26" stroke="var(--d-rule)" stroke-width="1"/>
<text x="603" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.60</text>
<rect x="626" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="649" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="672" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.78" stroke="var(--d-rule)" stroke-width="1"/>
<text x="695" y="179" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.80</text>
<rect x="718" y="152" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="741" y="179" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="764" y="152" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="787" y="179" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="580" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.04" stroke="var(--d-rule)" stroke-width="1"/>
<text x="603" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.10</text>
<rect x="626" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.30" stroke="var(--d-rule)" stroke-width="1"/>
<text x="649" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.70</text>
<rect x="672" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.48" stroke="var(--d-rule)" stroke-width="1"/>
<text x="695" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">1.10</text>
<rect x="718" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.70" stroke="var(--d-rule)" stroke-width="1"/>
<text x="741" y="225" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.60</text>
<rect x="764" y="198" width="46" height="46" fill="var(--d-red)" fill-opacity="0.85" stroke="var(--d-rule)" stroke-width="1"/>
<text x="787" y="225" text-anchor="middle" class="heat-light" style="font-size:11px;">-&#8734;</text>
<rect x="580" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.09" stroke="var(--d-rule)" stroke-width="1"/>
<text x="603" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.20</text>
<rect x="626" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.09" stroke="var(--d-rule)" stroke-width="1"/>
<text x="649" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.20</text>
<rect x="672" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="695" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="718" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.39" stroke="var(--d-rule)" stroke-width="1"/>
<text x="741" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.90</text>
<rect x="764" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.87" stroke="var(--d-rule)" stroke-width="1"/>
<text x="787" y="271" text-anchor="middle" class="heat-light" style="font-size:11.5px;">2.00</text>
<line x1="816" y1="175" x2="834" y2="175" class="s4-flow-arrow" marker-end="url(#s4-arrowhead)"/>
<text x="955" y="20" class="lbl" text-anchor="middle" style="font-size:13px;">Softmax</text>
<rect x="840" y="60" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="1.00" stroke="var(--d-rule)" stroke-width="1"/>
<text x="863" y="87" text-anchor="middle" class="heat-light" style="font-size:11.5px;">1.00</text>
<rect x="886" y="60" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="909" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="932" y="60" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="955" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="978" y="60" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1001" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="1024" y="60" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1047" y="87" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="840" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.31" stroke="var(--d-rule)" stroke-width="1"/>
<text x="863" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.31</text>
<rect x="886" y="106" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.69" stroke="var(--d-rule)" stroke-width="1"/>
<text x="909" y="133" text-anchor="middle" class="heat-light" style="font-size:11.5px;">0.69</text>
<rect x="932" y="106" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="955" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="978" y="106" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1001" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="1024" y="106" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1047" y="133" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="840" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.18" stroke="var(--d-rule)" stroke-width="1"/>
<text x="863" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.18</text>
<rect x="886" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.24" stroke="var(--d-rule)" stroke-width="1"/>
<text x="909" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.24</text>
<rect x="932" y="152" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.59" stroke="var(--d-rule)" stroke-width="1"/>
<text x="955" y="179" text-anchor="middle" class="heat-light" style="font-size:11.5px;">0.59</text>
<rect x="978" y="152" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1001" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="1024" y="152" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1047" y="179" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="840" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.10" stroke="var(--d-rule)" stroke-width="1"/>
<text x="863" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.10</text>
<rect x="886" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.18" stroke="var(--d-rule)" stroke-width="1"/>
<text x="909" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.18</text>
<rect x="932" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.27" stroke="var(--d-rule)" stroke-width="1"/>
<text x="955" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.27</text>
<rect x="978" y="198" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.45" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1001" y="225" text-anchor="middle" class="heat-light" style="font-size:11.5px;">0.45</text>
<rect x="1024" y="198" width="46" height="46" fill="var(--d-paper)" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1047" y="225" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0</text>
<rect x="840" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.08" stroke="var(--d-rule)" stroke-width="1"/>
<text x="863" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.08</text>
<rect x="886" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.08" stroke="var(--d-rule)" stroke-width="1"/>
<text x="909" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.08</text>
<rect x="932" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.17" stroke="var(--d-rule)" stroke-width="1"/>
<text x="955" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.17</text>
<rect x="978" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.17" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1001" y="271" text-anchor="middle" class="heat-dark" style="font-size:11.5px;">0.17</text>
<rect x="1024" y="244" width="46" height="46" fill="var(--d-teal-strong)" fill-opacity="0.50" stroke="var(--d-rule)" stroke-width="1"/>
<text x="1047" y="271" text-anchor="middle" class="heat-light" style="font-size:11.5px;">0.50</text>
</svg>
          <figcaption>Fig. 33. How the causal mask works: raw scores, the mask, the masked scores, and the resulting softmax.</figcaption>
        </figure>
      </div>

      <p style="margin-top: 1.2rem;"><strong>Training an LLM</strong> on next-token prediction doesn't require explicit labelled data. It's self-supervised: the target is that same input sequence shifted right by one.</p>
      <pre class="formula">input:  [BOS, "The", "cat", "sat", "on", EOS]
target: ["The", "cat", "sat", "on", EOS]   &larr; input shifted right by one</pre>
      <p>Because the causal mask guarantees position <code>i</code>'s logits depend only on tokens <code>&le; i</code>, a single forward pass produces a usable prediction at <em>every</em> position, not just the last one. So every token in the sequence contributes a training signal except the very last one, whose logits would be predicting whatever comes after <code>EOS</code>, a token this example simply doesn't have. Cross-entropy loss is averaged over all the positions that do have a target:</p>
      <p class="table-caption" style="margin: .8rem 0 -.4rem;">Formula 8.</p>
      <div class="formula">$$\mathcal{L} = -\frac{1}{N}\sum_{i=1}^{N} \log P(x_{i+1} \mid x_{\le i})$$</div>
      <p class="code-filename"><code>next_token_loss.py</code></p>
      <pre class="formula highlight"><code><span class="n">logits</span> <span class="o">=</span> <span class="nf">model</span><span class="p">(</span><span class="n">input_ids</span><span class="p">)</span>                        <span class="c1"># [B, seq_len, vocab]
</span><span class="n">loss</span> <span class="o">=</span> <span class="nf">cross_entropy</span><span class="p">(</span>
    <span class="n">logits</span><span class="p">[:,</span> <span class="p">:</span><span class="o">-</span><span class="mi">1</span><span class="p">,</span> <span class="p">:],</span>   <span class="c1"># every position except the last (EOS has no target)
</span>    <span class="n">input_ids</span><span class="p">[:,</span> <span class="mi">1</span><span class="p">:],</span>    <span class="c1"># the actual next token at each of those positions
</span><span class="p">)</span></code></pre>
      <p><strong>What about during inference?</strong> During inference, we anyways don't have future tokens, we're predicting it token by token. So inference doesn't require causal masking.<br> (Note : only if the LLM were to predict from very first token.)</p>

      <h3 id="prefill-vs-decode">Prefill vs. Decode</h3>
      <p>Generation is never a blank slate: it's built on top of the prompt the user gives, a question, an instruction, anything. <strong>Prefill</strong> is one parallel forward pass over that whole prompt: it builds the KV cache and produces the first token's logits, exactly like training. <strong>Decode</strong> then generates one token at a time with n forward passes, reusing that cache.</p>
      <p><strong>Prefill needs a causal mask</strong>: it computes every prompt position in one pass, so without the mask, position <code>i</code>'s cached key/value would encode information from positions after it, corrupting every later decode step that attends back to it.<strong> Decode needs no mask</strong>: each step has only one query token, and no future tokens exist yet to leak from.</p>

      <div class="diagram-wrap">
        <figure>
<svg id="pd-svg" viewBox="0 0 780 340" role="img" aria-label="Interactive diagram of prefill and decode for the prompt Explain ML in brief, with Query on the left, the accumulated softmax attention-score matrix in the middle, and the growing K and V cache on the right. Stage 1, prefill: Q, K and V each get 4 rows, computed together in one parallel forward pass; the causal score matrix's last row already yields the first generated token, Machine, and its output vector, softmax weights dotted with V, is shown feeding a predicted-token box. Stages 2 to 4, decode: earlier rows of Q are shown faded and struck through, since they already produced their output and are not recomputed, while a single new Q row is added each step; K and V each gain one new cached row, shown outlined in red; the attention-score matrix gains one new, wider row each step, five then six then seven columns, and its softmax output vector predicts the next word, learning then is then a." style="max-width:100%;height:auto;">
<defs>
  <marker id="pd-arrowhead" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
</defs>
<g id="pd-stage-0" class="pd-stage">
<text x="390" y="14" text-anchor="middle" class="lbl" style="font-size:13px;">Prefill &mdash; 1 forward pass builds Q, K, V for all 4 prompt tokens</text>
<text x="91" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">Q</text>
<text x="195" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">softmax(QK&#8288;<tspan baseline-shift="super" style="font-size:8px;">T</tspan>)</text>
<text x="455" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">K cache</text>
<text x="545" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">V cache</text>
<text x="169" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 169 62)">Explain</text>
<text x="199" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 199 62)">ML</text>
<text x="229" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 229 62)">in</text>
<text x="259" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 259 62)">brief</text>
<text x="66" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-q-swatch">
<rect x="74.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g>
<text x="146" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g>
<rect x="150" y="74" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="1.0" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="92" text-anchor="middle" class="heat-light" style="font-size:9.5px;">1.00</text>
</g>
</g>
<text x="410" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-k-cached">
<rect x="418.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-v-cached">
<rect x="508.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-q-swatch">
<rect x="74.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g>
<text x="146" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g>
<rect x="150" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.378" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="122" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.38</text>
</g>
<g>
<rect x="180" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.622" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="122" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.62</text>
</g>
</g>
<text x="410" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-k-cached">
<rect x="418.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-v-cached">
<rect x="508.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-q-swatch">
<rect x="74.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g>
<text x="146" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g>
<rect x="150" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.187" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.19</text>
</g>
<g>
<rect x="180" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.252" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.25</text>
</g>
<g>
<rect x="210" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.561" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="152" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.56</text>
</g>
</g>
<text x="410" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-k-cached">
<rect x="418.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-v-cached">
<rect x="508.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-q-swatch">
<rect x="74.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g>
<text x="146" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g>
<rect x="150" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.1" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="180" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.134" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="210" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.221" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.22</text>
</g>
<g class="pd-cell-new">
<rect x="240" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.545" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="182" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.54</text>
</g>
</g>
<text x="410" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-k-cached">
<rect x="418.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-v-cached">
<rect x="508.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="546" y1="179" x2="576" y2="179" class="pd-arrow"/>
<g class="pd-out">
<rect x="580.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.402" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="588.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.534" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="597.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.546" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="605.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.495" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="580.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="597" y="160" text-anchor="middle" class="sub" style="font-size:9px;">out</text>
<line x1="620" y1="179" x2="650" y2="179" class="pd-arrow" marker-end="url(#pd-arrowhead)"/>
<g class="pd-pred">
<rect x="654" y="166" width="86" height="26" rx="6"/>
<text x="697" y="183" text-anchor="middle">&ldquo;Machine&rdquo;</text>
</g>
<text x="697" y="160" text-anchor="middle" class="sub" style="font-size:9px;">(via LM head)</text>
<text x="390" y="214" text-anchor="middle" class="sub" style="font-size:10.5px;">Q, K, V: 4 rows each, all computed together &middot; nothing cached yet</text>
</g>

<g id="pd-stage-1" class="pd-stage" style="display:none;">
<text x="390" y="14" text-anchor="middle" class="lbl" style="font-size:13px;">Decode step 1 &mdash; 1 forward pass, Q collapses to 1 new row</text>
<text x="91" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">Q</text>
<text x="210" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">softmax(QK&#8288;<tspan baseline-shift="super" style="font-size:8px;">T</tspan>)</text>
<text x="455" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">K cache</text>
<text x="545" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">V cache</text>
<text x="169" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 169 62)">Explain</text>
<text x="199" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 199 62)">ML</text>
<text x="229" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 229 62)">in</text>
<text x="259" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 259 62)">brief</text>
<text x="289" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 289 62)">Machine</text>
<text x="66" y="93" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">Explain</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="89" x2="108" y2="89" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g>
<rect x="150" y="74" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="1.0" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="92" text-anchor="middle" class="heat-light" style="font-size:9.5px;">1.00</text>
</g>
</g>
<text x="410" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-k-cached">
<rect x="418.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-v-cached">
<rect x="508.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="123" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">ML</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="119" x2="108" y2="119" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g>
<rect x="150" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.378" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="122" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.38</text>
</g>
<g>
<rect x="180" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.622" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="122" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.62</text>
</g>
</g>
<text x="410" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-k-cached">
<rect x="418.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-v-cached">
<rect x="508.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="153" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">in</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="149" x2="108" y2="149" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g>
<rect x="150" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.187" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.19</text>
</g>
<g>
<rect x="180" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.252" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.25</text>
</g>
<g>
<rect x="210" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.561" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="152" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.56</text>
</g>
</g>
<text x="410" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-k-cached">
<rect x="418.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-v-cached">
<rect x="508.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="183" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">brief</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="179" x2="108" y2="179" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g>
<rect x="150" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.1" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="180" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.134" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="210" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.221" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.22</text>
</g>
<g>
<rect x="240" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.545" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="182" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.54</text>
</g>
</g>
<text x="410" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-k-cached">
<rect x="418.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-v-cached">
<rect x="508.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g class="pd-qbox">
<rect x="20" y="196" width="72" height="26" rx="6"/>
<text x="56" y="213" text-anchor="middle">&ldquo;Machine&rdquo;</text>
</g>
<g>
<text x="146" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g>
<rect x="150" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.077" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="180" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.103" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="210" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.126" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="240" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.23" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.23</text>
</g>
<g class="pd-cell-new">
<rect x="270" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.463" stroke="var(--d-rule)" stroke-width="1"/>
<text x="285" y="212" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.46</text>
</g>
</g>
<text x="410" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g class="pd-k-new">
<rect x="418.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g class="pd-v-new">
<rect x="508.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="546" y1="209" x2="576" y2="209" class="pd-arrow"/>
<g class="pd-out">
<rect x="580.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.508" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="588.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.415" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="597.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.65" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="605.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.363" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="580.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="597" y="190" text-anchor="middle" class="sub" style="font-size:9px;">out</text>
<line x1="620" y1="209" x2="650" y2="209" class="pd-arrow" marker-end="url(#pd-arrowhead)"/>
<g class="pd-pred">
<rect x="654" y="196" width="86" height="26" rx="6"/>
<text x="697" y="213" text-anchor="middle">&ldquo;learning&rdquo;</text>
</g>
<text x="697" y="190" text-anchor="middle" class="sub" style="font-size:9px;">(via LM head)</text>
<text x="390" y="244" text-anchor="middle" class="sub" style="font-size:10.5px;">Q: 1 new row (row 5) &middot; K/V cache: 4 cached + 1 new = 5</text>
</g>

<g id="pd-stage-2" class="pd-stage" style="display:none;">
<text x="390" y="14" text-anchor="middle" class="lbl" style="font-size:13px;">Decode step 2 &mdash; 1 forward pass, Q collapses to 1 new row</text>
<text x="91" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">Q</text>
<text x="225" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">softmax(QK&#8288;<tspan baseline-shift="super" style="font-size:8px;">T</tspan>)</text>
<text x="455" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">K cache</text>
<text x="545" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">V cache</text>
<text x="169" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 169 62)">Explain</text>
<text x="199" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 199 62)">ML</text>
<text x="229" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 229 62)">in</text>
<text x="259" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 259 62)">brief</text>
<text x="289" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 289 62)">Machine</text>
<text x="319" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 319 62)">learning</text>
<text x="66" y="93" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">Explain</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="89" x2="108" y2="89" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g>
<rect x="150" y="74" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="1.0" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="92" text-anchor="middle" class="heat-light" style="font-size:9.5px;">1.00</text>
</g>
</g>
<text x="410" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-k-cached">
<rect x="418.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-v-cached">
<rect x="508.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="123" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">ML</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="119" x2="108" y2="119" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g>
<rect x="150" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.378" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="122" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.38</text>
</g>
<g>
<rect x="180" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.622" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="122" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.62</text>
</g>
</g>
<text x="410" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-k-cached">
<rect x="418.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-v-cached">
<rect x="508.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="153" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">in</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="149" x2="108" y2="149" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g>
<rect x="150" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.187" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.19</text>
</g>
<g>
<rect x="180" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.252" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.25</text>
</g>
<g>
<rect x="210" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.561" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="152" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.56</text>
</g>
</g>
<text x="410" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-k-cached">
<rect x="418.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-v-cached">
<rect x="508.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="183" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">brief</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="179" x2="108" y2="179" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g>
<rect x="150" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.1" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="180" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.134" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="210" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.221" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.22</text>
</g>
<g>
<rect x="240" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.545" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="182" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.54</text>
</g>
</g>
<text x="410" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-k-cached">
<rect x="418.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-v-cached">
<rect x="508.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="213" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">Machine</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="209" x2="108" y2="209" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g>
<rect x="150" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.077" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="180" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.103" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="210" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.126" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="240" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.23" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.23</text>
</g>
<g>
<rect x="270" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.463" stroke="var(--d-rule)" stroke-width="1"/>
<text x="285" y="212" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.46</text>
</g>
</g>
<text x="410" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g class="pd-k-cached">
<rect x="418.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g class="pd-v-cached">
<rect x="508.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g class="pd-qbox">
<rect x="20" y="226" width="72" height="26" rx="6"/>
<text x="56" y="243" text-anchor="middle">&ldquo;learning&rdquo;</text>
</g>
<g>
<text x="146" y="243" text-anchor="end" class="sub" style="font-size:10px;">learning</text>
<g>
<rect x="150" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.068" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.07</text>
</g>
<g>
<rect x="180" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.076" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="210" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.092" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.09</text>
</g>
<g>
<rect x="240" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.102" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="270" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.205" stroke="var(--d-rule)" stroke-width="1"/>
<text x="285" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.21</text>
</g>
<g class="pd-cell-new">
<rect x="300" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.457" stroke="var(--d-rule)" stroke-width="1"/>
<text x="315" y="242" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.46</text>
</g>
</g>
<text x="410" y="243" text-anchor="end" class="sub" style="font-size:10px;">learning</text>
<g class="pd-k-new">
<rect x="418.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="231" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="243" text-anchor="end" class="sub" style="font-size:10px;">learning</text>
<g class="pd-v-new">
<rect x="508.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="231" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="546" y1="239" x2="576" y2="239" class="pd-arrow"/>
<g class="pd-out">
<rect x="580.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.457" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="588.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.597" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="597.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.464" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="605.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.493" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="580.0" y="231" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="597" y="220" text-anchor="middle" class="sub" style="font-size:9px;">out</text>
<line x1="620" y1="239" x2="650" y2="239" class="pd-arrow" marker-end="url(#pd-arrowhead)"/>
<g class="pd-pred">
<rect x="654" y="226" width="86" height="26" rx="6"/>
<text x="697" y="243" text-anchor="middle">&ldquo;is&rdquo;</text>
</g>
<text x="697" y="220" text-anchor="middle" class="sub" style="font-size:9px;">(via LM head)</text>
<text x="390" y="274" text-anchor="middle" class="sub" style="font-size:10.5px;">Q: 1 new row (row 6) &middot; K/V cache: 5 cached + 1 new = 6</text>
</g>

<g id="pd-stage-3" class="pd-stage" style="display:none;">
<text x="390" y="14" text-anchor="middle" class="lbl" style="font-size:13px;">Decode step 3 &mdash; 1 forward pass, Q collapses to 1 new row</text>
<text x="91" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">Q</text>
<text x="240" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">softmax(QK&#8288;<tspan baseline-shift="super" style="font-size:8px;">T</tspan>)</text>
<text x="455" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">K cache</text>
<text x="545" y="28" text-anchor="middle" class="clbl" style="font-size:11px;">V cache</text>
<text x="169" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 169 62)">Explain</text>
<text x="199" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 199 62)">ML</text>
<text x="229" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 229 62)">in</text>
<text x="259" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 259 62)">brief</text>
<text x="289" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 289 62)">Machine</text>
<text x="319" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 319 62)">learning</text>
<text x="349" y="62" text-anchor="end" class="sub" style="font-size:9px;" transform="rotate(-35 349 62)">is</text>
<text x="66" y="93" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">Explain</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="89" x2="108" y2="89" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g>
<rect x="150" y="74" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="1.0" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="92" text-anchor="middle" class="heat-light" style="font-size:9.5px;">1.00</text>
</g>
</g>
<text x="410" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-k-cached">
<rect x="418.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="93" text-anchor="end" class="sub" style="font-size:10px;">Explain</text>
<g class="pd-v-cached">
<rect x="508.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="81" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="81" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="123" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">ML</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="119" x2="108" y2="119" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g>
<rect x="150" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.378" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="122" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.38</text>
</g>
<g>
<rect x="180" y="104" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.622" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="122" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.62</text>
</g>
</g>
<text x="410" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-k-cached">
<rect x="418.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="123" text-anchor="end" class="sub" style="font-size:10px;">ML</text>
<g class="pd-v-cached">
<rect x="508.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="111" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="111" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="153" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">in</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="149" x2="108" y2="149" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g>
<rect x="150" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.187" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.19</text>
</g>
<g>
<rect x="180" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.252" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="152" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.25</text>
</g>
<g>
<rect x="210" y="134" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.561" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="152" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.56</text>
</g>
</g>
<text x="410" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-k-cached">
<rect x="418.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="153" text-anchor="end" class="sub" style="font-size:10px;">in</text>
<g class="pd-v-cached">
<rect x="508.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="141" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="141" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="183" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">brief</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="179" x2="108" y2="179" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g>
<rect x="150" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.1" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="180" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.134" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="210" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.221" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="182" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.22</text>
</g>
<g>
<rect x="240" y="164" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.545" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="182" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.54</text>
</g>
</g>
<text x="410" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-k-cached">
<rect x="418.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="183" text-anchor="end" class="sub" style="font-size:10px;">brief</text>
<g class="pd-v-cached">
<rect x="508.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="171" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="171" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="213" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">Machine</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="209" x2="108" y2="209" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g>
<rect x="150" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.077" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="180" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.103" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="210" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.126" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.13</text>
</g>
<g>
<rect x="240" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.23" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="212" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.23</text>
</g>
<g>
<rect x="270" y="194" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.463" stroke="var(--d-rule)" stroke-width="1"/>
<text x="285" y="212" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.46</text>
</g>
</g>
<text x="410" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g class="pd-k-cached">
<rect x="418.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.9" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="213" text-anchor="end" class="sub" style="font-size:10px;">Machine</text>
<g class="pd-v-cached">
<rect x="508.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="201" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.2" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="201" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="66" y="243" text-anchor="end" class="sub pd-ghost-label2" style="font-size:10px;">learning</text>
<g class="pd-q-ghost-row">
<rect x="74.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="82.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="91.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="99.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="74.0" y="231" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="74" y1="239" x2="108" y2="239" class="pd-ghost-strike"/>
<g class="pd-row-historical">
<text x="146" y="243" text-anchor="end" class="sub" style="font-size:10px;">learning</text>
<g>
<rect x="150" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.068" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.07</text>
</g>
<g>
<rect x="180" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.076" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="210" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.092" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.09</text>
</g>
<g>
<rect x="240" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.102" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.10</text>
</g>
<g>
<rect x="270" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.205" stroke="var(--d-rule)" stroke-width="1"/>
<text x="285" y="242" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.21</text>
</g>
<g>
<rect x="300" y="224" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.457" stroke="var(--d-rule)" stroke-width="1"/>
<text x="315" y="242" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.46</text>
</g>
</g>
<text x="410" y="243" text-anchor="end" class="sub" style="font-size:10px;">learning</text>
<g class="pd-k-cached">
<rect x="418.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="231" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="243" text-anchor="end" class="sub" style="font-size:10px;">learning</text>
<g class="pd-v-cached">
<rect x="508.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.8" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="231" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="231" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<g class="pd-qbox">
<rect x="20" y="256" width="72" height="26" rx="6"/>
<text x="56" y="273" text-anchor="middle">&ldquo;is&rdquo;</text>
</g>
<g>
<text x="146" y="273" text-anchor="end" class="sub" style="font-size:10px;">is</text>
<g>
<rect x="150" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.063" stroke="var(--d-rule)" stroke-width="1"/>
<text x="165" y="272" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.06</text>
</g>
<g>
<rect x="180" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.069" stroke="var(--d-rule)" stroke-width="1"/>
<text x="195" y="272" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.07</text>
</g>
<g>
<rect x="210" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.077" stroke="var(--d-rule)" stroke-width="1"/>
<text x="225" y="272" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="240" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.085" stroke="var(--d-rule)" stroke-width="1"/>
<text x="255" y="272" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.08</text>
</g>
<g>
<rect x="270" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.115" stroke="var(--d-rule)" stroke-width="1"/>
<text x="285" y="272" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.11</text>
</g>
<g>
<rect x="300" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.171" stroke="var(--d-rule)" stroke-width="1"/>
<text x="315" y="272" text-anchor="middle" class="heat-dark" style="font-size:9.5px;">0.17</text>
</g>
<g class="pd-cell-new">
<rect x="330" y="254" width="30" height="30" fill="var(--d-teal-strong)" fill-opacity="0.42" stroke="var(--d-rule)" stroke-width="1"/>
<text x="345" y="272" text-anchor="middle" class="heat-light" style="font-size:9.5px;">0.42</text>
</g>
</g>
<text x="410" y="273" text-anchor="end" class="sub" style="font-size:10px;">is</text>
<g class="pd-k-new">
<rect x="418.0" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="426.5" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.6" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="435.0" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="443.5" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="418.0" y="261" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="500" y="273" text-anchor="end" class="sub" style="font-size:10px;">is</text>
<g class="pd-v-new">
<rect x="508.0" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.7" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="516.5" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.4" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="525.0" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.5" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="533.5" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.3" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="508.0" y="261" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<line x1="546" y1="269" x2="576" y2="269" class="pd-arrow"/>
<g class="pd-out">
<rect x="580.0" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.563" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="588.5" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.487" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="597.0" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.495" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="605.5" y="261" width="8.5" height="16" fill="var(--d-teal-strong)" fill-opacity="0.406" stroke="var(--d-rule)" stroke-width="0.6"/>
<rect x="580.0" y="261" width="34.0" height="16" class="pd-swatch-frame" fill="none"/>
</g>
<text x="597" y="250" text-anchor="middle" class="sub" style="font-size:9px;">out</text>
<line x1="620" y1="269" x2="650" y2="269" class="pd-arrow" marker-end="url(#pd-arrowhead)"/>
<g class="pd-pred">
<rect x="654" y="256" width="86" height="26" rx="6"/>
<text x="697" y="273" text-anchor="middle">&ldquo;a&rdquo;</text>
</g>
<text x="697" y="250" text-anchor="middle" class="sub" style="font-size:9px;">(via LM head)</text>
<text x="390" y="304" text-anchor="middle" class="sub" style="font-size:10.5px;">Q: 1 new row (row 7) &middot; K/V cache: 6 cached + 1 new = 7</text>
</g>

</svg>
          <div class="pd-controls">
            <button type="button" id="pd-replay" class="pd-btn">&#9654;&#xFE0E; Replay</button>
            <input type="range" id="pd-slider" min="0" max="3" step="1" value="0"/>
            <span id="pd-readout" class="sub pd-readout">Prefill: Q, K and V each get 4 rows, computed together in one causal-masked, softmaxed pass. Row 4's output vector already yields the first generated token, &ldquo;Machine&rdquo;, for free.</span>
          </div>
          <figcaption>Fig. 34. Prefill vs. decode: Q/K/V computation and the growing KV cache, step by step.</figcaption>
        </figure>
      </div>
      <script>
      (function(){
        var steps = 4;
        var svg = document.getElementById('pd-svg');
        if (!svg || svg.dataset.wired) return;
        svg.dataset.wired = '1';
        var slider = document.getElementById('pd-slider');
        var readout = document.getElementById('pd-readout');
        var replayBtn = document.getElementById('pd-replay');
        var desc = [
          'Prefill: Q, K and V each get 4 rows, computed together in one causal-masked, softmaxed pass. Row 4&rsquo;s output vector already yields the first generated token, &ldquo;Machine&rdquo;, for free.',
          'Decode step 1: Q adds 1 new row, &ldquo;Machine&rdquo; (earlier rows are faded and struck through, already used). K/V cache grows to 5 rows. Its output vector &rarr; predicts &ldquo;learning&rdquo;.',
          'Decode step 2: Q adds 1 new row, &ldquo;learning&rdquo;. K/V cache grows to 6 rows. Its output vector &rarr; predicts &ldquo;is&rdquo;.',
          'Decode step 3: Q adds 1 new row, &ldquo;is&rdquo;. K/V cache grows to 7 rows. Its output vector &rarr; predicts &ldquo;a&rdquo;.'
        ];

        function render(v){
          for (var i = 0; i < steps; i++){
            var g = document.getElementById('pd-stage-'+i);
            if (g) g.style.display = (i === v) ? '' : 'none';
          }
          slider.value = v;
          readout.innerHTML = desc[v];
        }

        var timer = null;
        function stopAutoplay(){ if (timer){ clearInterval(timer); timer = null; } }
        function playFrom(start){
          stopAutoplay();
          var i = start;
          render(i);
          timer = setInterval(function(){
            i++;
            if (i >= steps){ stopAutoplay(); return; }
            render(i);
          }, 2000);
        }

        slider.addEventListener('pointerdown', stopAutoplay);
        slider.addEventListener('input', function(){ stopAutoplay(); render(parseInt(slider.value, 10)); });
        replayBtn.addEventListener('click', function(){ playFrom(0); });

        render(0);

        if ('IntersectionObserver' in window){
          var io = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
              if (entry.isIntersecting){ playFrom(0); io.disconnect(); }
            });
          }, { threshold: 0.4 });
          io.observe(svg);
        } else {
          playFrom(0);
        }
      })();
      </script>
      <style>
        .pd-controls{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-top:8px; font-family:'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; }
        .pd-btn{ font-family:inherit; font-size:12.5px; font-weight:700; color:var(--d-ink); background:var(--d-paper); border:1.5px solid var(--d-teal); border-radius:6px; padding:4px 10px; cursor:pointer; }
        .pd-btn:hover{ background:var(--d-container-bg); }
        #pd-slider{ flex:1 1 160px; min-width:120px; accent-color:var(--d-teal-strong); }
        .pd-readout{ white-space:normal; }
        .pd-arrow{ stroke: var(--d-red); stroke-width: 2.2; fill: none; }
        .pd-pred rect{ fill: var(--d-paper); stroke: var(--d-teal-strong); stroke-width: 2; stroke-dasharray: 4 4; }
        .pd-pred text{ font-family:'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; font-size: 12px; font-weight: 700; fill: var(--d-teal-strong); }
        .pd-qbox rect{ fill: var(--d-paper); stroke: var(--d-red); stroke-width: 2.4; }
        .pd-qbox text{ font-family:'JetBrains Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace; font-size: 12px; font-weight: 700; fill: var(--d-red); }
        .pd-cell-new rect{ stroke: var(--d-red); stroke-width: 2.4; }
        .pd-swatch-frame{ stroke: var(--d-rule); stroke-width: 1; }
        .pd-k-new .pd-swatch-frame, .pd-v-new .pd-swatch-frame{ stroke: var(--d-red); stroke-width: 2; }
        .pd-q-swatch .pd-swatch-frame{ stroke: var(--d-teal); stroke-width: 1; }
        .pd-out .pd-swatch-frame{ stroke: var(--d-teal-strong); stroke-width: 1.6; }
        .pd-q-ghost-row{ opacity: .45; }
        .pd-ghost-label2{ opacity: .55; }
        .pd-ghost-strike{ stroke: var(--d-red); stroke-width: 1.4; }
        .pd-row-historical{ opacity: .5; }
      </style>

      <h3 id="how-paligemma-masks">How PaliGemma Does Masking</h3>
      <figure class="figure">
        <div class="figure-frame">
          <a href="/img/blogs/paligemma-3b/paligemma-mask.png" target="_blank" rel="noopener"><img src="/img/blogs/paligemma-3b/paligemma-mask.png" alt="PaliGemma's Prefix-LM masking grid: rows and columns for every image, prefix (BOS, input tokens, SEP), and suffix/target (output tokens, EOS, PAD) token, with checkmarks showing image and prefix rows fully attending to all image and prefix columns but never to suffix columns, and suffix rows attending causally to image, prefix, and suffix tokens up to and including themselves."></a>
        </div>
        <figcaption class="figure-caption">Fig. 35. Figure 2, <a href="https://arxiv.org/abs/2407.07726" target="_blank" rel="noopener">PaliGemma paper</a>.</figcaption>
      </figure>

      <p>PaliGemma's prompt looks different from a normal decoder-only LLM's: <code>[image tokens, BOS, text tokens, SEP]</code>. It uses <strong>Prefix-LM masking</strong>: no causal mask during prefill, so image tokens are allowed to attend to the text tokens that come after them in the prompt. This lets <strong>the image tokens' attention be shaped by the task </strong>at hand, detection, OCR, whatever the prompt asks for, so vision features are conditioned on the task before generation ever begins.</p>
    </section>

    <section>
      <h2 id="image-detection-segmentation-tokens">Special Tokens</h2>

      <h3 id="detection-tokens">Object Detection: Location Tokens</h3>
      <p>PaliGemma has no bounding-box regression head, no anchor boxes, no NMS, no Hungarian matching, none of the machinery in Faster R-CNN/YOLO/DETR.<br> Section 3.1 of the paper: <em>"During PaliGemma's pretraining, we limit ourselves to 'text' covering natural language, object detection, and instance segmentation, but this API remains versatile."</em><br>A bounding box is just another string the decoder autoregressively generates: <strong>1024 vocabulary tokens, each one bin of a 1024-way discretization of a normalized image coordinate (<code>[0,1]</code> split into 1024 bins).</strong><br> A box is 4 tokens, <code>y_min</code>, <code>x_min</code>, <code>y_max</code>, <code>x_max</code>:</p>
      <pre class="formula">"detect cat" &rarr; &lt;loc0120&gt; &lt;loc0200&gt; &lt;loc0450&gt; &lt;loc0600&gt; cat
                 y_min     x_min     y_max     x_max   entity</pre>
      <p>At inference:</p>
      <pre class="formula">decode a &lt;locXXXX&gt; token
&rarr; bin index 0&ndash;1023
&rarr; divide by 1024
&rarr; normalized coordinate in [0,1]
&rarr; multiply by the checkpoint's actual pixel resolution (224/448/896)
&rarr; pixel coordinate</pre>

      <h3 id="segmentation-tokens">Segmentation: Segment Tokens</h3>
      <p>As paper mentions: <em>"We also add 128 VQVAE tokenized single-object mask tokens (<code>&lt;seg000&gt;</code> to <code>&lt;seg127&gt;</code>) to support referring expression segmentation."</em><br> A paligemma segmentation example output format:</p>
      <pre class="formula">"&lt;loc0347&gt;&lt;loc0553&gt;&lt;loc0788&gt;&lt;loc0749&gt;&lt;seg093&gt;&lt;seg106&gt;...&lt;seg127&gt;&lt;seg121&gt;;cat"
 &#9492;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;location tokens&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9496;&#9492;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;segmentation tokens&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9472;&#9496;&#9492;entity&#9496;</pre>
      <p>4 <code>&lt;loc&gt;</code> tokens (bounding box) plus 16 <code>&lt;seg&gt;</code> tokens (mask) per object.</p>
      <div class="diagram-wrap">
        <div class="legend">
          <div class="legend-item"><span class="swatch module"></span>module / op</div>
          <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
        </div>
        <figure>
<svg viewBox="0 0 900 800" role="img" aria-label="VQ-VAE architecture with concrete shapes: an input segmentation mask, shape batch by 64 by 64 by 1, is passed through a CNN encoder to produce a 4 by 4 grid of continuous latent vectors. A nearest-neighbor search, shown as a magnifying glass icon, looks up the closest entry in a codebook of 128 entries for each latent vector, producing a 4 by 4 grid of discrete indices, 16 indices total, each between 0 and 127, and their corresponding quantized vectors. Those quantized vectors pass through a CNN decoder to produce a reconstructed mask, shape batch by 64 by 64 by 1." style="max-width:100%;height:auto;">
<defs>
  <marker id="vqvae-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
  </marker>
  <filter id="vqvae-rough" x="-8%" y="-8%" width="116%" height="116%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="19" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</defs>
<polygon class="term" points="270,20 570,20 584,76 256,76" filter="url(#vqvae-rough)"/>
<text x="420" y="49" class="lbl" text-anchor="middle">Input Mask</text>
<text x="420" y="65" class="sub" text-anchor="middle">(B, 64, 64, 1)</text>
<line x1="420" y1="76" x2="420" y2="130" class="arrow" marker-end="url(#vqvae-arrowhead)"/>
<rect x="371.0" y="92.0" width="98.0" height="22" rx="6" class="shapepill"/>
<text x="420" y="107.0" class="shapetxt" text-anchor="middle">(B, 64, 64, 1)</text>
<rect class="proc" x="270" y="130" width="300" height="56" rx="10" filter="url(#vqvae-rough)"/>
<text x="420" y="170.0" class="lbl" text-anchor="middle">CNN Encoder</text>
<line x1="420" y1="186" x2="420" y2="240" class="arrow" marker-end="url(#vqvae-arrowhead)"/>
<rect x="375.0" y="202.0" width="90.0" height="22" rx="6" class="shapepill"/>
<text x="420" y="217.0" class="shapetxt" text-anchor="middle">(B, 4, 4, d)</text>
<polygon class="term" points="270,240 570,240 584,296 256,296" filter="url(#vqvae-rough)"/>
<text x="420" y="269" class="lbl" text-anchor="middle">Latent Vectors</text>
<text x="420" y="285" class="sub" text-anchor="middle">(B, 4, 4, d), continuous</text>
<line x1="420" y1="296" x2="420" y2="370" class="arrow"/>
<circle cx="420" cy="318" r="9" class="arrow" fill="none"/>
<line x1="426.5" y1="324.5" x2="434.1" y2="332.1" class="arrow" stroke-linecap="round"/>
<text x="420" y="354" class="sub" text-anchor="middle">nearest-neighbor search</text>
<polygon class="term" points="270,370 570,370 584,426 256,426" filter="url(#vqvae-rough)"/>
<text x="420" y="399" class="lbl" text-anchor="middle">Codebook</text>
<text x="420" y="415" class="sub" text-anchor="middle">128 entries, each d-dim</text>
<line x1="420" y1="426" x2="420" y2="480" class="arrow" marker-end="url(#vqvae-arrowhead)"/>
<rect x="276.5" y="442.0" width="287.0" height="22" rx="6" class="shapepill"/>
<text x="420" y="457.0" class="shapetxt" text-anchor="middle">(B, 4, 4) &mdash; 16 indices, 0&ndash;127</text>
<polygon class="term" points="270,480 570,480 584,536 256,536" filter="url(#vqvae-rough)"/>
<text x="420" y="509" class="lbl" text-anchor="middle">Quantized Vectors</text>
<text x="420" y="525" class="sub" text-anchor="middle">(B, 4, 4, d), discrete</text>
<line x1="420" y1="536" x2="420" y2="590" class="arrow" marker-end="url(#vqvae-arrowhead)"/>
<rect x="375.0" y="552.0" width="90.0" height="22" rx="6" class="shapepill"/>
<text x="420" y="567.0" class="shapetxt" text-anchor="middle">(B, 4, 4, d)</text>
<rect class="proc" x="270" y="590" width="300" height="56" rx="10" filter="url(#vqvae-rough)"/>
<text x="420" y="630.0" class="lbl" text-anchor="middle">CNN Decoder</text>
<line x1="420" y1="646" x2="420" y2="700" class="arrow" marker-end="url(#vqvae-arrowhead)"/>
<rect x="371.0" y="662.0" width="98.0" height="22" rx="6" class="shapepill"/>
<text x="420" y="677.0" class="shapetxt" text-anchor="middle">(B, 64, 64, 1)</text>
<polygon class="term" points="270,700 570,700 584,756 256,756" filter="url(#vqvae-rough)"/>
<text x="420" y="729" class="lbl" text-anchor="middle">Reconstructed Mask</text>
<text x="420" y="745" class="sub" text-anchor="middle">(B, 64, 64, 1)</text>
</svg>
          <figcaption>Fig. 38. VQ-VAE architecture.</figcaption>
        </figure>
      </div>

      <p style="margin-top: 1.2rem;">PaliGemma uses a <strong>VQ-VAE</strong> trained to compress segmentation masks: an encoder maps the mask to continuous latent vectors, each is quantized to its nearest codebook entry, and a decoder reconstructs the mask from those quantized vectors. The 128 codebook entries are exactly PaliGemma's <code>&lt;seg000&gt;</code>&ndash;<code>&lt;seg127&gt;</code> tokens.</p>
      <p>At inference, PaliGemma generates left to right: first the bounding box (<code>&lt;loc0347&gt;&lt;loc0553&gt;&lt;loc0788&gt;&lt;loc0749&gt;</code>), then 16 <code>&lt;seg&gt;</code> tokens (<code>&lt;seg093&gt;&lt;seg106&gt;...&lt;seg121&gt;</code>), one per codebook index. The VQ-VAE then looks up each index's codebook vector, arranges the 16 vectors into the 4&times;4 latent grid, and decodes them into a binary mask, which gets placed inside the predicted bounding box.</p>


    </section>


    <section>
      <h2 id="training-stages">Training Stages / Phases</h2>
      <p>PaliGemma's training is split into 4 stages:</p>

      <div class="stage-flow">
        <div class="stage-col">
          <p class="stage-label">Stage 0</p>
          <p class="stage-name">Unimodal Pretrain</p>
          <p class="stage-desc">Off-the-shelf checkpoints, nothing custom.</p>
          <p class="stage-outcome">SigLIP-So400m + Gemma-2B, pretrained separately, reused as-is.</p>
        </div>
        <div class="stage-connector">&rarr;</div>
        <div class="stage-col">
          <p class="stage-label">Stage 1</p>
          <p class="stage-name">Multimodal Pretrain</p>
          <p class="stage-desc">Train everything, broad task mixture, 224px, 1B examples.</p>
          <p class="stage-outcome">Model understands images + text broadly, but only at 224px resolution.</p>
        </div>
        <div class="stage-connector">&rarr;</div>
        <div class="stage-col">
          <p class="stage-label">Stage 2</p>
          <p class="stage-name">Resolution Increase</p>
          <p class="stage-desc">Continue pretraining at higher res: 448px +50M / 896px +10M examples.</p>
          <p class="stage-outcome">Model handles small text/objects, fine detail at 448px/896px.</p>
        </div>
        <div class="stage-connector">&rarr;</div>
        <div class="stage-col">
          <p class="stage-label">Stage 3</p>
          <p class="stage-name">Transfer</p>
          <p class="stage-desc">Fine-tune per downstream task, all params tunable.</p>
          <p class="stage-outcome">Task-specific specialist checkpoints (COCOcap, RefCOCO, NLVR2, ...).</p>
        </div>
      </div>

      <h3 id="stage0">Stage0: Unimodal Pretraining</h3>
      <p>No custom pretraining, just reuse two already-trained checkpoints:</p>
      <ul>
        <li><strong>SigLIP-So400m</strong> ("shape optimized" ViT), contrastively pretrained via sigmoid loss.</li>
        <li><strong>Gemma-2B v1.0</strong>, raw pretrained checkpoint.</li>
      </ul>

      <h3 id="stage1">Stage1: Multimodal Pretraining</h3>
      <p>Combines the two unimodal models and trains the <strong>whole model</strong>: nothing frozen, including the image encoder. As mentioned in the PaliGemma paper, contrary to common practice (e.g. LiT) of freezing the image encoder here, PaliGemma keeps it trainable, following CapPa/LocCa findings that captioning objectives teach the encoder spatial/relational skills that contrastive pretraining (CLIP/SigLIP-style) misses.</p>
      <p>A slow linear warm-up on the image encoder's learning rate avoids destructive gradients from the initially-misaligned LLM.</p>
      <p>Trained on a broad mixture of tasks, each prefixed by task type so skills don't conflict:<br> <code>caption {lang}</code>, <code>ocr</code>, <code>answer en {question}</code>, <code>question {lang} {English answer}</code>, <code>detect {thing};{thing};...</code>, <code>segment {thing};{thing};...</code>, <code>caption &lt;ymin&gt;&lt;xmin&gt;&lt;ymax&gt;&lt;xmax&gt;</code> (grounded captioning).</p>
      <p>Run at <strong>224&times;224</strong> resolution (256 image tokens), text sequence length 128, for <strong>1 billion examples</strong>: the goal at this stage is breadth of cross-task visual knowledge (concepts/cultures/languages).</p>

      <h3 id="stage2">Stage2: Resolution Increase</h3>
      <p>Stage1's 224px model can't handle small-object detection/segmentation or reading small text (charts/infographics/documents), so two further checkpoints are trained at higher resolution: <strong>448&times;448</strong> (+50M examples) and <strong>896&times;896</strong> (+10M examples).</p>
      <p>Same task mixture as Stage1, but upweights resolution-sensitive tasks and allows longer suffixes (up to <code>N_txt = 512</code>) so e.g. OCR can request all text, detection/segmentation can request all annotated objects.</p>

      <h3 id="stage3">Stage3: Transfer</h3>
      <p>Fine-tune the Stage1/2 base checkpoints per-task on <strong>30+ downstream benchmarks (COCO Captions, Remote Sensing VQA, Video Captioning, InfographicQA, multi-image NLVR2, bounding-box WidgetCap, etc.)</strong>. All parameters are tunable, with a per-task hyperparameter sweep over resolution/epochs/LR/label-smoothing/dropout/weight-decay/freeze-ViT/beam-search.</p>
      <p><strong>A single "mix" checkpoint</strong> is also released, jointly transferred on a subset of tasks plus detailed captioning/long QA, described as "a step in the direction of" instruction tuning, but not full instruction tuning.</p>

    </section>

    <section>
      <h3 id="not-instruction-tuned-intro">Why PaliGemma Is Not an Instruction-Tuned Model</h3>
      <p>PaliGemma differs from models like LLaVA or GPT-4-based ones, which are trained on <code>(image, instruction, response)</code> triples covering many task types phrased as natural instructions or conversations, rather than one fixed template per task. That training lets those models hold follow-up conversations after the initial prompt and answer. PaliGemma is an open base VLM without instruction tuning, a deliberate scope decision.</p>
    </section>

    <section>
      <h2 id="results">Results</h2>
      <p>Section 4 of the paper transfers PaliGemma to 30+ downstream benchmarks by fine-tuning, none of which are part of the pretraining mixture, their images are explicitly removed from the pretraining data, so these are genuine held-out evaluations. Table 1 reports scores for all three resolution checkpoints (224px, 448px, 896px) where applicable.</p>
      <div class="table-wrap">
        <table class="blog-table">
          <thead><tr><th>Task</th><th>224px</th><th>448px</th><th>896px</th></tr></thead>
          <tbody>
            <tr><td>COCOcap (captioning)</td><td>141.9</td><td>144.6</td><td>&mdash;</td></tr>
            <tr><td>VQAv2</td><td>83.2</td><td>85.6</td><td>&mdash;</td></tr>
            <tr><td>GQA</td><td>65.6</td><td>67.0</td><td>&mdash;</td></tr>
            <tr><td>TextVQA</td><td>55.5</td><td>73.2</td><td>76.5</td></tr>
            <tr><td>ChartQA (human)</td><td>40.0</td><td>54.2</td><td>74.9</td></tr>
            <tr><td>RefCOCO (testA, segmentation)</td><td>75.7</td><td>77.9</td><td>78.7</td></tr>
            <tr><td>RefCOCOg (test, segmentation)</td><td>68.2</td><td>71.0</td><td>72.7</td></tr>
          </tbody>
        </table>
        <p class="table-caption">Table 3. A representative slice of the paper's own Table 1. Resolution-sensitive tasks like TextVQA and ChartQA gain the most from higher-resolution checkpoints; captioning and general VQA barely move.</p>
      </div>
      <p>Video tasks are evaluated only at 224px (16 sampled frames, each encoded separately): ActivityNet-QA 50.8, ActivityNet-CAP 34.6, MSRVTT-QA 50.1, MSRVTT-CAP 70.5, MSVD-QA 60.2, VATEX 79.7.</p>
      <p>The paper highlights one result (Section 7, Noteworthy tidbits): <em>"Our MMVP result is SOTA by a large margin. PaliGemma at 224px achieves 47.3% paired accuracy, while GPT4-V and Gemini achieve 38.7% and 40.7%, respectively, and all other models including LLaVa perform below chance."</em></p>
    </section>

    <section>
      <h2 id="lingering-thoughts">Lingering Thoughts</h2>
      <p>Working in the medical domain, mostly with images, videos, and text, I find VLMs like PaliGemma genuinely appealing. But the question I keep coming back to: are these decoder-only architectures, trained on a grab-bag of cross-task data, actually good enough to replace battle-tested, purpose-built segmentation, detection, and landmark models?<br>
      If we're fine-tuning VLMs per task anyway to hit benchmark numbers, why not just fine-tune a dedicated segmentation encoder or YOLO detector instead?<br>
      Is the industry actually moving toward unified architectures, where boxes, masks, and text are all just tokens an LLM spits out, or is that still more promise than proof?</p>
      <p>The paper doesn't help me answer this. It never benchmarks PaliGemma against dedicated single-task detectors or segmentation encoders, only against other VLMs (PaLI-X, PaLM-E). Its "state of the art" claims are relative to other VLMs, not to the specialist models it would actually need to beat to replace them.</p>
      <p>Still, <strong>the model punches above its weight at 3B parameters</strong>, and the paper's ablations, on the image encoder, the connector design, whether to freeze the vision tower, are genuinely thought-provoking. If you want to implement it yourself, <a href="https://www.youtube.com/watch?v=vAmKB7iPkWw" target="_blank" rel="noopener">Umar Jamil's 5-hour walkthrough</a> is an excellent guide to the mechanics, though it isn't production-ready: MQA isn't handled efficiently, and the image encoder reruns needlessly at every decode step.</p>
      <p>My honest read: for a fixed, well-scoped task, a specialist model is still probably the safer bet. What a VLM buys you is flexibility, one model, prompted differently, doing detection, segmentation, and captioning without three separate pipelines. </p>
    </section>

    <section class="sources">
      <h2 id="sources">Sources</h2>
      <ol>
        <li>Noam Shazeer: <em>Fast Transformer Decoding: One Write-Head is All You Need</em>, <a href="https://arxiv.org/abs/1911.02150" target="_blank" rel="noopener">arXiv:1911.02150</a> (2019)</li>
        <li>Sebastian Raschka: <em>Build a Large Language Model (From Scratch)</em>, positional embeddings diagram, <a href="https://sebastianraschka.com/images/LLMs-from-scratch-images/ch02_compressed/18.webp" target="_blank" rel="noopener">image source</a></li>
        <li>Su et al.: <em>RoFormer: Enhanced Transformer with Rotary Position Embedding</em></li>
        <li>Umar Jamil: <em>Coding a Multimodal (Vision) Language Model from scratch in PyTorch with full explanation</em>, <a href="https://www.youtube.com/watch?v=vAmKB7iPkWw" target="_blank" rel="noopener">YouTube video</a></li>
        <li>Umar Jamil: companion project repo, <a href="https://github.com/hkproj/pytorch-paligemma/tree/main" target="_blank" rel="noopener">github.com/hkproj/pytorch-paligemma</a></li>
        <li>Beyer, Steiner, Susano Pinto, et al.: <em>PaliGemma: A versatile 3B VLM for transfer</em>, <a href="https://arxiv.org/abs/2407.07726" target="_blank" rel="noopener">arXiv:2407.07726</a></li>
        <li>Liu, Li, Wu, Lee: <em>Visual Instruction Tuning</em> (LLaVA), <a href="https://arxiv.org/abs/2304.08485" target="_blank" rel="noopener">arXiv:2304.08485</a></li>
        <li>The Gustafson: <em>Causal Masking</em>, <a href="https://thegustafson.com/blog/causal-masking#:~:text=HOW%20THE%20MASK%20IS%20APPLIED%3A%20ADDITIVE%2C%20BEFORE%20SOFTMAX" target="_blank" rel="noopener">how the mask is applied: additive, before softmax</a></li>
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
