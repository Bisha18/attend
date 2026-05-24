export async function fetchRfidData(dateString) {
  try {
    const url = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnS5GW-rymNWu34uMGUHIcFb2gUBmZ9YB1wZmuawJfpQEXDycq9Pb0wCzETY70BmGtGw7w4PeB0M7Teyi0K1g6A72873bh6Gravf0Zzi79DynQeNxg5Y67_2iNXVqdOkVApChf6kJoM63-iZrwPYBF0LCD6RBR4FxBq10lhT-ndIbG5GYhxbrsWV6ievKFxzoi7UrnmP_p2upFBws7czbOeHMn-R-IbGr4qyY8YDrUQDP4tWXKnKX4PQVHP0i1Y9ESup6R0GBRz_Q0Z--Uf7OJlD1T3_mijwv72kWCLkrdq9voHkOac&lib=MY7O9JFgtW-79HBbCNj2y9bmrpNyoMq-E'
    
    // Using fetch
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch RFID data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter by date, assuming dateString is YYYY-MM-DD
    // Sheet date format is DD/MM/YYYY
    const [year, month, day] = dateString.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    const todaysScans = data.filter(record => record.DATE === formattedDate);
    
    // Return a list of unique UIDs from today
    const uniqueUids = [...new Set(todaysScans.map(s => s.UID))];
    
    return uniqueUids;
  } catch (error) {
    console.error("RFID Fetch Error:", error);
    return [];
  }
}

export async function fetchAllRfidLogs(dateString) {
  try {
    const url = 'https://opensheet.elk.sh/1DxTHbJHPMwyzaY9tbUrGulBr_1EhDB-Zm6omlbwunec/Sheet1';
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch RFID data: ${response.statusText}`);
    
    const data = await response.json();
    
    if (dateString) {
      const [year, month, day] = dateString.split('-');
      const formattedDate = `${day}/${month}/${year}`;
      return data.filter(record => record.DATE === formattedDate);
    }
    
    return data;
  } catch (error) {
    console.error("RFID Fetch Logs Error:", error);
    return [];
  }
}
