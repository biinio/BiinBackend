module.exports = {

    ENTER_BIIN_REGION: "1",//TO->ID:beacon identifier
    EXIT_BIIN_REGION: "2",//TO->ID:beacon identifier
    BIIN_NOTIFIED: "3", //TO->ID:_id object in biins
    NOTIFICATION_OPENED: "4", //TO->ID:_id object in biins

    ENTER_ELEMENT_VIEW: "5", //TO->ID:element identifier
    EXIT_ELEMENT_VIEW: "6", //TO->ID:element identifier
    LIKE_ELEMENT: "7", //TO->ID:element identifier
    UNLIKE_ELEMENT: "8", //TO->ID:element identifier
    COLLECTED_ELEMENT: "9", //TO->ID:element identifier
    UNCOLLECTED_ELEMENT: "10", //TO->ID:element identifier
    SHARE_ELEMENT: "11", //TO->ID:element identifier

    ENTER_SITE_VIEW: "12", //TO->ID:site identifier
    EXIT_SITE_VIEW: "13", //TO->ID:site identifier
    LIKE_SITE: "14", //TO->ID:site identifier
    UNLIKE_SITE: "15", //TO->ID:site identifier
    FOLLOW_SITE: "16", //TO->ID:site identifier
    UNFOLLOW_SITE: "17", //TO->ID:site identifier
    SHARE_SITE: "18", //TO->ID:site identifier

    ENTER_BIIN: "19", //TO->ID:beacon identifier
    EXIT_BIIN: "20", //TO->ID:beacon identifier

    OPEN_APP: "21", //TO->"biin_ios"
    CLOSE_APP: "22" //TO->"biin_ios"
};