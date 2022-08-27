function main(e) {
  // sheets
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let userdata_sheet = spreadsheet.getSheetByName('userdata');
  let config_sheet = spreadsheet.getSheetByName('config');

  for (let i=2; i <= userdata_sheet.getLastRow(); i++){
    let username = userdata_sheet.getRange(i, 1).getValue();
    
    // Get contest data
    let url = `https://atcoder.jp/users/${username}/history/json`;
    let response = UrlFetchApp.fetch(url).getContentText();
    let json = JSON.parse(response);

    let latest_contest = json[json.length-1];

    let contest_name = latest_contest.ContestName
    var place = latest_contest.Place
    var performance = Number(latest_contest.Performance)
    var old_rating = Number(latest_contest.OldRating)
    var new_rating = Number(latest_contest.NewRating)
    let diff = new_rating - old_rating;

    let user_latest_contest_name = userdata_sheet.getRange(i, 2).getValue();

    // Check updated contest data
    if (contest_name !== user_latest_contest_name){
      let contest_screen_name = latest_contest.ContestScreenName
      contest_screen_name = contest_screen_name.split('.')[0]
      let shared_link = `https://atcoder.jp/users/satory074/history/share/${contest_screen_name}`

      let content = `[${username}]
  Contest: ${contest_name}
  Place: ${place}
  Performance: ${performance}
  Rating: ${old_rating} -> ${new_rating} (${diff})
  Shared Link: ${shared_link}
      `;

      // Post data
      const payload = {
        username: config_sheet.getRange(2, 1).getValue(),
        avatar_url: config_sheet.getRange(2, 2).getValue(),
        content: content,
      };

      // Post via webhook
      let webhook = config_sheet.getRange(2, 3).getValue()
      UrlFetchApp.fetch(webhook, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
      });

      // Update user_latest_contest_name
      userdata_sheet.getRange(i, 2).setValue(contest_name);
    }
  }
}
