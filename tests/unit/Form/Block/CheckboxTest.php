<?php

namespace MailPoet\Test\Form\Block;

use MailPoet\Form\Block\Checkbox;
use MailPoet\Form\Util\FieldNameObfuscator;
use MailPoet\Test\Form\HtmlParser;
use MailPoet\WP\Functions as WPFunctions;
use PHPUnit\Framework\MockObject\MockObject;

require_once __DIR__ . '/../HtmlParser.php';

class CheckboxTest extends \MailPoetUnitTest {
  /** @var Checkbox */
  private $checkbox;

  /** @var MockObject|WPFunctions */
  private $wpMock;

  /** @var MockObject|FieldNameObfuscator */
  private $obfuscatorMock;

  /** @var HtmlParser */
  private $htmlParser;

  private $data = [
    'type' => 'checkbox',
    'name' => 'Custom checkbox',
    'id' => '1',
    'unique' => '1',
    'static' => '0',
    'params' => [
      'label' => 'Input label',
      'required' => '',
      'hide_label' => '',
      'values' => [[
        'value' => 'Checkbox label',
        'is_checked' => '1',
      ]],
    ],
    'position' => '1',
  ];
  public function _before() {
    parent::_before();
    $this->wpMock = $this->createMock(WPFunctions::class);
    $this->wpMock->method('escAttr')->will($this->returnArgument(0));
    $this->obfuscatorMock = $this->createMock(FieldNameObfuscator::class);
    $this->obfuscatorMock->method('obfuscate')->will($this->returnArgument(0));
    $this->checkbox = new Checkbox($this->obfuscatorMock, $this->wpMock);
    $this->htmlParser = new HtmlParser();
  }

  public function testItShouldRenderCheckbox() {
    $html = $this->checkbox->render($this->data);
    $checkboxLabel = $this->htmlParser->findByXpath($html, "//label[@class='mailpoet_checkbox_label']")->item(1);
    assert($checkboxLabel instanceof \DOMNode);
    expect($checkboxLabel->nodeValue)->equals(' Checkbox label');
    $checkbox = $checkboxLabel->getElementsByTagName('input')->item(0);
    assert($checkbox instanceof \DOMNode);
    $checked = $checkbox->attributes->getNamedItem('checked');
    assert($checked instanceof \DOMNode);
    expect($checked->value)->equals('checked');
  }
}
