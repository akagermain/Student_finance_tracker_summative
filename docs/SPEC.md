# Pocketful

This is a simple student finance tracker build with plain HTML, CSS, and JavaScript, no other frameworks. Students add what they spend, search and sort their records and watch their spending against a monthly cap

## Sections

Landing at the web you find different parts of app. These are: `dashboard`, `records`, `form`, `settings`, `about`. I'll explain briefly the purpose of each section.

### Dashboard
It shows total records, total spending, the top category spent on, last 7 days chart, and monthly cap bar. The message which displays on monthly cap part is a polite one until when you go over your cap and it turns into an urgent message. It also shows the top three latest records.

### Records
It demonstrates a table of items, you can search, sort, edit, and delete as you want.

### Form
This is the section of adding new expenses and editing them.

### Settings
It demonstrates monthly cap, modifications of currency and rates is done here, currently USD and RWF are only in the platform, also you can export a file of records. You can also change the theme between light and dark.

## Wireframes
These are different design pictures of my web app, for both phones and desktop. They are saved in wirefames folder.

## Data Model
This is how the data will be stored. Every expense is has an id, a description, amount, category, date, and two timestamps, when it was creates, and when it was last updated. The following is an example:

'''
{
    id: "rec_0001",
    description: "Monthly internet",
    amount: 15000,
    category: "Bills",
    date: "02-10-2026",
    createdAt: "2026-10-02T08:23:00.000Z",
    updateAt: "2026-10-02T08:23:00.000Z"
}
'''

## Regex Rules
Four fields are are checked with regex patterns. Description can not start or end with a space, the amount have to be a number with up to two decimals. The date is typed as day, month, year, where 30th or 31st of February can never be a date. The category can only have letters, spaces, and hyphens. The advanced rule uses a back-reference to catch a repeated word, like "Bike bike", because that is usually a typo. The following are the patterns used:

- Description: `^\S(?:.*\S)?$`
    No spaces at the start or at the end. Also double spaces inside are collapsed with `\s{2,}`

- Amount: `^(0|[1-9]\d*)(\.\d{1,2})?$`
    Whole number or up to decimals. No leading zeros and zeros only are rejected.

- Date: `^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}`
    The format is dd-mm-yyy, and it rejects dates like 30/31-02-2026.

- Category: `^[A-Za-z]+(?:[ -][A-Za-z]+)*$`
    Letters, spaces and hyphens only are allowed. Words like Food, Self-care, Food and drinks are allowed. But Food2, -Food or Food--drinks are not allowed.

- Advanced one: `\b(\w+)\s+\1\b`
    This is a back-reference pattern, it warns about repeated words. For example Pay payment is allowed but Lunch lunch is not allowed.

When Loading json file or saved data, the following check are used:
 - ID: `^[A-Za-z0-9_-]{1,40}$`
 - Timestamp: `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$`

## Accessibility plan
Proper page landmark are used (header, nav, main, secction, footer, and orderd headings), a skip link, labels on every input, a visible focus outline, good colour contrast and large buttons. The whole app can work with keyboard only.

## Responsive plan

- width: 360px
    One column, bottom tab bar, records as cards
- width: 768px
    Side menu, records as a table, two-columns stats
- width: 1024px
    Wider side menu, dashboard in two columns

## Note
The base currency is fixed at RWF, with USD and EUR rates that you type yourself in settings.