<?php

namespace MailPoet\Form\Block;

class Radio extends Base {

  public static function render($block) {
    $html = '';

    $fieldName = 'data[' . static::getFieldName($block) . ']';
    $fieldValidation = static::getInputValidation($block);

    $html .= '<p class="mailpoet_paragraph">';

    $html .= static::renderLabel($block);

    $options = (!empty($block['params']['values'])
      ? $block['params']['values']
      : []
    );

    $selectedValue = self::getFieldValue($block);

    foreach ($options as $option) {
      $html .= '<label class="mailpoet_radio_label">';

      $html .= '<input type="radio" class="mailpoet_radio" ';

      $html .= 'name="' . $fieldName . '" ';

      if (is_array($option['value'])) {
        $value = key($option['value']);
        $label = reset($option['value']);
      } else {
        $value = $option['value'];
        $label = $option['value'];
      }

      $html .= 'value="' . esc_attr($value) . '" ';

      $html .= (
        (
          $selectedValue === ''
          && isset($option['is_checked'])
          && $option['is_checked']
        ) || ($selectedValue === $value)
      ) ? 'checked="checked"' : '';

      $html .= $fieldValidation;
      $html .= ' /> ' . esc_attr($label);
      $html .= '</label>';
    }

    $html .= '<span class="mailpoet_error_' . $block['id'] . '"></span>';

    $html .= '</p>';

    return $html;
  }
}
