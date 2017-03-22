window.onload=function() {
// https://www.programmableweb.com/category/all/apis?keyword=holiday

moment.locale('de');
var today = moment().startOf('day');
var thisMonth = today.startOf('month');
console.log('Current month is', thisMonth.toJSON())
new Vue({
  el: '#app',
  created: function () {
    this.addMonth();
    this.addMonth();
    this.fetchHollidays();
  },
  data: {
    months: [],
    team: JSON.parse(sessionStorage.getItem('absence-list')) || [],
    newGirl: '',
    events: [],
  },
  methods: {
    addMonth() {
      if (this.months.length >= 12) return;

      if (this.months.length === 0) {
        this.months.push({
          date: thisMonth,
          label: this.getMonthLabel(thisMonth),
          days: this.getDays(thisMonth)
        });
      } else {
        var month = moment(this.months[this.months.length - 1].date).add(1, 'months');
        this.months.push({
          date: month,
          label: this.getMonthLabel(month),
          days: this.getDays(month)
        });
      }

      this.updateHolidays();
    },
    removeMonth() {
      if (this.months.length > 1) {
        this.months.pop();
      }
    },
    getMonthLabel(month) {
      return month.format('MMMM');
    },
    getDays(month) {
      var mom = moment(month);
      var currMonth = mom.get('month');
      var days = [];
      mom.date(1);

      while(mom.get('month') === currMonth) {
        days.push({
          day: mom.format('D'),
          wd: mom.format('dd'),
          wnr: mom.day() === 1 ? mom.format('WW') : null,
          isWe: [6, 0].indexOf(mom.day()) !== -1,
          holiday: this.isHoliday(mom)
        })
        mom = mom.add(1, 'days');
      }

      return days;
    },
    isHoliday(mom) {
      if (!this.events) return false;

      for(var i = 0; i < this.events.length; i++) {
        var e = this.events[i];
        if (e.start.isSameOrBefore(mom) && e.end.isAfter(mom)) {
          return e.label;
        }
      }
      return false;
    },
    updateHolidays() {
      if (this.events.length === 0) return;

      this.months.forEach(m => {
        var date = moment(m.date);
        m.days.forEach((d) => {
          d.holiday = this.isHoliday(date);
          date.add(1, 'days');
        });
      });
    },
    addGirl() {
      this.team.push(this.newGirl.trim());
      this.team.sort();
      sessionStorage.setItem('absence-list', JSON.stringify(this.team));
      this.newGirl = '';
    },
    removeGirl(name) {
      this.team = this.team.filter((n) => n !== name);
      sessionStorage.setItem('absence-list', JSON.stringify(this.team));
    },
    fetchHollidays() {
      if (!this.months.length) return;
      var dateFrom = this.months[0].date;
      var dateTo = moment(dateFrom).add(1, 'year');
      //var url = 'https://calendar.google.com/calendar/ical/en.austrian%23holiday%40group.v.calendar.google.com/public/basic.ics';
      var url = 'https://clients6.google.com/calendar/v3/calendars/de.austrian%23holiday@group.v.calendar.google.com/events?' +
        'calendarId=de.austrian%23holiday%40group.v.calendar.google.com&singleEvents=true&timeZone=Europe%2FVienna&maxAttendees=1&' + 
        'maxResults=250&sanitizeHtml=true&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs' +
        '&timeMin=' + encodeURIComponent(dateFrom.format()) + '&timeMax=' + encodeURIComponent(dateTo.format());
        //'&timeMin=2017-02-26T00%3A00%3A00%2B01%3A00&timeMax=2017-04-02T00%3A00%3A00%2B01%3A00';
      var xhr = new XMLHttpRequest()
      var self = this
      console.log('GET', url);
      xhr.open('GET', url)
      xhr.onload = function () {
        self.events = JSON.parse(xhr.responseText)
          .items.map((i) => ({
            start: moment(i.start.date),
            end: moment(i.end.date),
            label: i.summary
          }))

        self.updateHolidays();
      }
      xhr.send()
    }
  }
})

}