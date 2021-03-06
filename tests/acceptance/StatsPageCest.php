<?php

namespace MailPoet\Test\Acceptance;

use MailPoet\Test\DataFactories\Newsletter;

class StatsPageCest {

  public function statsPage(\AcceptanceTester $i) {
    $i->wantTo('Open stats page of a sent newsletter');

    $newsletterTitle = 'Stats Page Test';
    (new Newsletter())->withSubject($newsletterTitle)
      ->withSentStatus()
      ->withSendingQueue()
      ->create();

    $i->login();
    $i->amOnMailpoetPage('Emails');
    $i->waitForText($newsletterTitle);
    $i->clickItemRowActionByItemName($newsletterTitle, 'Statistics');
    $i->waitForText('Stats: ' . $newsletterTitle);
    $i->see('Buy the Premium to see your stats');

    $href = $i->grabAttributeFrom('//a[text()="Sign Up for Free"]', 'href');
    expect($href)->contains('https://www.mailpoet.com/free-plan?utm_medium=stats&utm_campaign=signup&utm_source=plugin');
    $href = $i->grabAttributeFrom('//a[text()="Learn more about Premium"]', 'href');
    expect($href)->endsWith('page=mailpoet-premium');
  }

}
