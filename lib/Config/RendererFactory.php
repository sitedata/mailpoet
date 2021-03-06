<?php

namespace MailPoet\Config;

class RendererFactory {

  /** @var Renderer|null */
  private $renderer;

  public function getRenderer() {
    if (!$this->renderer) {
      $caching = !WP_DEBUG;
      $debugging = WP_DEBUG;
      $this->renderer = new Renderer($caching, $debugging);
    }
    return $this->renderer;
  }
}
