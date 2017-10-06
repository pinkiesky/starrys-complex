module.exports = function starrysDate2js (stDate) {
    if (!stDate || !stDate.Date) {
        return new Date(0);
    }

    const jsDate = new Date(2000 + stDate.Date.Year, stDate.Date.Month, stDate.Date.Day);
    if (stDate.Time) {
        jsDate.setHours(stDate.Time.Hour, stDate.Time.Minute, stDate.Time.Second);
    }

    return jsDate;
};
