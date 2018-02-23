import Vue from 'vue'
import VueMoment from 'vue-moment'

Vue.use(VueMoment)
Vue.moment.calendarFormat = (myMoment, now) => {
  const diff = myMoment.diff(now, 'days', true)
  const nextMonth = now.clone().add(1, 'month')

  const retVal = diff < -14 ? 'sameElse'
    : diff < -8 ? 'lastWeek'
      : diff < -1 ? 'nextWeek'
        : diff < 0 ? 'lastDay'
          : diff < 1 ? 'sameDay'
            : diff < 2 ? 'nextDay'
              // introduce thisMonth and nextMonth
              : (myMoment.month() === now.month() && myMoment.year() === now.year()) ? 'thisMonth'
                : (nextMonth.month() === myMoment.month() && nextMonth.year() === myMoment.year()) ? 'nextMonth' : 'sameElse'
  return retVal
}
