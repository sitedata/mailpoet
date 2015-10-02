<?php

use MailPoet\Mailer\SendGrid;

class SendGridCest {
  function __construct() {
    $this->data = array(
      'api_key' => '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',
      'from_email' => 'vlad@mailpoet.com',
      'from_name' => 'Vlad',
      'newsletter' => array(
        'subject' => 'hi there!',
        'body' => 'this is a test message....'
      ),
      'subscribers' => array(
        array(
          'email' => 'johndoe@mailpoet.com',
          'last_name' => 'Smith'
        ),
        array(
          'email' => 'janesmith@mailpoet.com',
          'first_name' => 'Jane',
          'last_name' => 'Smith'
        ),
        array(
          'email' => 'someone@mailpoet.com',
        ),
        array()
      )
    );

    $this->mailer = new SendGrid(
      $this->data['api_key'],
      $this->data['from_email'],
      $this->data['from_name'],
      $this->data['newsletter'],
      $this->data['subscribers']);
  }

  function itCanGenerateSubscribers() {
    $subscribers = $this->mailer->getSubscribers();
    expect(count($subscribers))->equals(3);
    // test proper handling of spaces between first/last name
    expect($subscribers[0])->equals(
      sprintf(
        '%s <%s>',
        $this->data['subscribers'][0]['last_name'],
        $this->data['subscribers'][0]['email'])
    );
    expect($subscribers[1])->equals(
      sprintf(
        '%s %s <%s>', $this->data['subscribers'][1]['first_name'],
        $this->data['subscribers'][1]['last_name'],
        $this->data['subscribers'][1]['email']
      )
    );
  }

  function itCanGenerateBody() {
    $urlEncodedBody = $this->mailer->getBody();
    expect($urlEncodedBody)
      ->contains(urlencode($this->data['newsletter']['subject']));

    $body = explode('&', urldecode($urlEncodedBody));
    expect($body[0])
      ->equals("from=" . sprintf('%s <%s>', $this->data['from_name'], $this->data['from_email']));
    expect($body[1])
      ->contains($this->data['subscribers'][0]['email']);
    expect($body[2])
      ->equals("to=" . $this->data['from_email']);
    expect($body[3])
      ->equals("subject=" . $this->data['newsletter']['subject']);
    expect($body[4])
      ->equals("html=" . $this->data['newsletter']['body']);
  }

    function itCanCreateRequest() {
      $request = $this->mailer->request();
      expect($request['timeout'])
        ->equals(10);
      expect($request['httpversion'])
        ->equals('1.1');
      expect($request['method'])
        ->equals('POST');
      expect($request['headers']['Content-Type'])
        ->equals('application/x-www-form-urlencoded');
      expect($request['body'])
        ->equals($this->mailer->getBody());
    }

    function itCannotSendWithoutSubscribers() {
      $mailer = new SendGrid(
        $this->data['api_key'],
        $this->data['from_email'],
        $this->data['from_name'],
        $this->data['newsletter'],
        array()
      );
      expect($mailer->send())->equals(false);
    }

    function itCannotSendWithoutProperAPIKey() {
      $mailer = new SendGrid(
        'someapikey',
        $this->data['from_email'],
        $this->data['from_name'],
        $this->data['newsletter'],
        $this->data['subscribers']
      );
      expect($mailer->send())->equals(false);
    }

    function itCanSend() {
      $result = $this->mailer->send();
      expect($result)->equals(true);
    }
}
