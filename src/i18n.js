import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      'Dashboard': 'Dashboard',
      'Clients': 'Clients',
      'Invoices': 'Invoices',
      'Reports': 'Reports',
      'Settings': 'Settings',
      'Logout': 'Logout',
      'Client Management': 'Client Management',
      'Add, view, and organize your client information.': 'Add, view, and organize your client information.',
      'Invoice Creation': 'Invoice Creation',
      'Create and customize professional invoices in minutes.': 'Create and customize professional invoices in minutes.',
      'Invoice List & Status': 'Invoice List & Status',
      'Track the status of all your invoices, from sent to paid.': 'Track the status of all your invoices, from sent to paid.',
      'PDF Generation': 'PDF Generation',
      'Generate and download PDF versions of your invoices.': 'Generate and download PDF versions of your invoices.',
      'SettingsTitle': 'Settings',
      'SettingsDesc': 'Customize your preferences for language and theme.',
      'Language': 'Language',
      'Theme': 'Theme',
      'Light': 'Light',
      'Dark': 'Dark',
      'System Default': 'System Default',
      'Export CSV': 'Export CSV',
      'From:': 'From:',
      'To:': 'To:',
      'Total Revenue': 'Total Revenue',
      'Outstanding': 'Outstanding',
      'Total Invoices': 'Total Invoices',
      'Total Tax Collected': 'Total Tax Collected',
      'Name': 'Name',
      'Email': 'Email',
      'Company': 'Company',
      'Phone': 'Phone',
      'Actions': 'Actions',
      'Add Client': 'Add Client',
      'Update Client': 'Update Client',
      'Cancel': 'Cancel',
      'No clients found.': 'No clients found.',
      'Loading...': 'Loading...',
      'DashboardDesc': 'This is your central hub for managing all your invoicing and client needs. From here, you can create new invoices, manage your client list, and view the status of all your financial documents.',
      'Total Amount': 'Total Amount',
      'Overdue': 'Overdue',
      'InvoiceApp': 'InvoiceApp',
      'English': 'English',
      'Romanian': 'Romanian',
      'German': 'German',
      'of the interface (where translations are available).': 'of the interface (where translations are available).',
      'of the website.': 'of the website.',
      'Client Portal': 'Client Portal',
      'Welcome': 'Welcome',
      'Total Invoices': 'Total Invoices',
      'Outstanding Balance': 'Outstanding Balance',
      'Paid Invoices': 'Paid Invoices',
      'Overdue Invoices': 'Overdue Invoices',
      'Recent Invoices': 'Recent Invoices',
      'View All': 'View All',
      'No invoices found.': 'No invoices found.',
      'Invoice': 'Invoice',
      'View': 'View',
      'Quick Actions': 'Quick Actions',
      'View All Invoices': 'View All Invoices',
      'Make Payment': 'Make Payment',
      'Update Profile': 'Update Profile',
      'Contact Support': 'Contact Support',
      'Client': 'Client',
      'Date': 'Date',
      'Due Date': 'Due Date',
      'Status': 'Status',
      'Currency': 'Currency',
      'Line Items': 'Line Items',
      'Qty': 'Qty',
      'Price': 'Price',
      'Tax': 'Tax',
      'Subtotal': 'Subtotal',
      'Discount': 'Discount',
      'Total': 'Total',
      'My Invoices': 'My Invoices',
      'Back to Dashboard': 'Back to Dashboard',
      'Invoice History': 'Invoice History',
      'View and manage all your invoices': 'View and manage all your invoices',
      'Search invoices...': 'Search invoices...',
      'All Status': 'All Status',
      'Pending': 'Pending',
      'Paid': 'Paid',
      'Overdue': 'Overdue',
      'completed': 'Completed',
      'No invoices found': 'No invoices found',
      'Try adjusting your search or filters': 'Try adjusting your search or filters',
      'You don\'t have any invoices yet': 'You don\'t have any invoices yet',
      'Invoice #': 'Invoice #',
      'Date/Paid Date': 'Date/Paid Date',
      'Amount': 'Amount',
      'Actions': 'Actions',
      'View': 'View',
      'Download': 'Download',
      'Payments': 'Payments',
      'invoices pending': 'invoices pending',
      'Total Paid': 'Total Paid',
      'payments made': 'payments made',
      'Last Payment': 'Last Payment',
      'No payments yet': 'No payments yet',
      'Outstanding Invoices': 'Outstanding Invoices',
      'Make payments on your pending invoices': 'Make payments on your pending invoices',
      'All caught up!': 'All caught up!',
      'You have no outstanding invoices.': 'You have no outstanding invoices.',
      'Due': 'Due',
      'Pay Now': 'Pay Now',
      'Payment History': 'Payment History',
      'View your past payment transactions': 'View your past payment transactions',
      'No payment history': 'No payment history',
      'Your payment history will appear here.': 'Your payment history will appear here.',
      'Payment Date': 'Payment Date',
      'Total Amount': 'Total Amount',
      'Payment Method': 'Payment Method',
      'Credit Card': 'Credit Card',
      'Debit Card': 'Debit Card',
      'Bank Transfer': 'Bank Transfer',
      'Card Number': 'Card Number',
      'Expiry Date': 'Expiry Date',
      'CVV': 'CVV',
      'Cardholder Name': 'Cardholder Name',
      'Enter cardholder name': 'Enter cardholder name',
      'Processing...': 'Processing...',
      'Process Payment': 'Process Payment',
      'My Profile': 'My Profile',
      'Loading profile...': 'Loading profile...',
      'Profile Settings': 'Profile Settings',
      'Update your personal information and preferences': 'Update your personal information and preferences',
      'Personal Information': 'Personal Information',
      'First Name': 'First Name',
      'Last Name': 'Last Name',
      'Email Address': 'Email Address',
      'Email cannot be changed': 'Email cannot be changed',
      'Phone Number': 'Phone Number',
      'Address Information': 'Address Information',
      'Street Address': 'Street Address',
      'City': 'City',
      'State/Province': 'State/Province',
      'ZIP/Postal Code': 'ZIP/Postal Code',
      'Country': 'Country',
      'Preferences': 'Preferences',
      'Timezone': 'Timezone',
      'Notification Preferences': 'Notification Preferences',
      'Email notifications': 'Email notifications',
      'SMS notifications': 'SMS notifications',
      'Saving...': 'Saving...',
      'Save Changes': 'Save Changes',
      'Loading...': 'Loading...',
      'Loading payments...': 'Loading payments...',
      'Loading invoices...': 'Loading invoices...',
      'Full Name': 'Full Name',
      'Email Address': 'Email Address',
      'Password': 'Password',
      'Sign Up': 'Sign Up',
      'Already have an account?': 'Already have an account?',
      'Sign In': 'Sign In',
      'English': 'English',
      'Romanian': 'Romanian',
      'German': 'German',
      'Contact Support': 'Contact Support',
      'Update Profile': 'Update Profile',
      'View All Invoices': 'View All Invoices',
      'Make Payment': 'Make Payment',
      'No description': 'No description',
      'N/A': 'N/A',
      'Client Portal Registration': 'Client Portal Registration',
      'Sign up to access your invoices, payment history, and update your profile.': 'Sign up to access your invoices, payment history, and update your profile.',
      'Create Your Client Account': 'Create Your Client Account',
      'Already have a client account?': 'Already have a client account?',
      'Log In': 'Log In'
    }
  },
  ro: {
    translation: {
      'Dashboard': 'Tablou de bord',
      'Clients': 'Clienți',
      'Invoices': 'Facturi',
      'Reports': 'Rapoarte',
      'Settings': 'Setări',
      'Logout': 'Deconectare',
      'Client Management': 'Gestionare clienți',
      'Add, view, and organize your client information.': 'Adaugă, vizualizează și organizează informațiile clienților.',
      'Invoice Creation': 'Creare factură',
      'Create and customize professional invoices in minutes.': 'Creează și personalizează facturi profesionale în câteva minute.',
      'Invoice List & Status': 'Listă și status facturi',
      'Track the status of all your invoices, from sent to paid.': 'Urmărește statusul tuturor facturilor, de la trimise la plătite.',
      'PDF Generation': 'Generare PDF',
      'Generate and download PDF versions of your invoices.': 'Generează și descarcă versiuni PDF ale facturilor.',
      'SettingsTitle': 'Setări',
      'SettingsDesc': 'Personalizează preferințele pentru limbă și temă.',
      'Language': 'Limbă',
      'Theme': 'Temă',
      'Light': 'Luminoasă',
      'Dark': 'Întunecată',
      'System Default': 'Implicit sistem',
      'Export CSV': 'Exportă CSV',
      'From:': 'De la:',
      'To:': 'Până la:',
      'Total Revenue': 'Venit total',
      'Outstanding': 'Restanță',
      'Total Invoices': 'Total facturi',
      'Total Tax Collected': 'Total TVA colectat',
      'Name': 'Nume',
      'Email': 'Email',
      'Company': 'Companie',
      'Phone': 'Telefon',
      'Actions': 'Acțiuni',
      'Add Client': 'Adaugă client',
      'Update Client': 'Actualizează client',
      'Cancel': 'Anulează',
      'No clients found.': 'Nu s-au găsit clienți.',
      'Loading...': 'Se încarcă...',
      'DashboardDesc': 'Acesta este centrul tău principal pentru gestionarea tuturor nevoilor de facturare și clienți. De aici poți crea facturi noi, gestiona lista de clienți și vizualiza statusul tuturor documentelor financiare.',
      'Total Amount': 'Suma totală',
      'Overdue': 'Restante',
      'InvoiceApp': 'Aplicație Facturi',
      'English': 'Engleză',
      'Romanian': 'Română',
      'German': 'Germană',
      'of the interface (where translations are available).': 'a interfeței (unde sunt disponibile traduceri).',
      'of the website.': 'a site-ului.',
      'Client Portal': 'Portal Client',
      'Welcome': 'Bun venit',
      'Total Invoices': 'Total Facturi',
      'Outstanding Balance': 'Sold Restant',
      'Paid Invoices': 'Facturi Plătite',
      'Overdue Invoices': 'Facturi Restante',
      'Recent Invoices': 'Facturi Recente',
      'View All': 'Vezi Toate',
      'No invoices found.': 'Nu s-au găsit facturi.',
      'Invoice': 'Factură',
      'View': 'Vezi',
      'Quick Actions': 'Acțiuni Rapide',
      'View All Invoices': 'Vezi Toate Facturile',
      'Make Payment': 'Fă Plată',
      'Update Profile': 'Actualizează Profilul',
      'Contact Support': 'Contactează Suportul',
      'Client': 'Client',
      'Date': 'Data',
      'Due Date': 'Data Scadenței',
      'Status': 'Status',
      'Currency': 'Monedă',
      'Line Items': 'Articole',
      'Qty': 'Cant',
      'Price': 'Preț',
      'Tax': 'TVA',
      'Subtotal': 'Subtotal',
      'Discount': 'Reducere',
      'Total': 'Total',
      'My Invoices': 'Facturile Mele',
      'Back to Dashboard': 'Înapoi la Tablou de bord',
      'Invoice History': 'Istoric Facturi',
      'View and manage all your invoices': 'Vezi și gestionează toate facturile',
      'Search invoices...': 'Caută facturi...',
      'All Status': 'Toate Statusurile',
      'Pending': 'În așteptare',
      'Paid': 'Plătit',
      'Overdue': 'Restante',
      'completed': 'Finalizat',
      'No invoices found': 'Nu s-au găsit facturi',
      'Try adjusting your search or filters': 'Încearcă să ajustezi căutarea sau filtrele',
      'You don\'t have any invoices yet': 'Nu ai nici o factură încă',
      'Invoice #': 'Factură #',
      'Date/Paid Date': 'Data/Data Plății',
      'Amount': 'Suma',
      'Actions': 'Acțiuni',
      'View': 'Vezi',
      'Download': 'Descarcă',
      'Payments': 'Plăți',
      'invoices pending': 'facturi în așteptare',
      'Total Paid': 'Total Plătit',
      'payments made': 'plăți efectuate',
      'Last Payment': 'Ultima Plăță',
      'No payments yet': 'Încă nu ai plăți',
      'Outstanding Invoices': 'Facturi Restante',
      'Make payments on your pending invoices': 'Plătește facturile în așteptare',
      'All caught up!': 'Toate în regulă!',
      'You have no outstanding invoices.': 'Nu ai facturi restante.',
      'Due': 'Scadent',
      'Pay Now': 'Plătește acum',
      'Payment History': 'Istoric Plăți',
      'View your past payment transactions': 'Vezi tranzacțiile de plată din trecut',
      'No payment history': 'Nu există istoric de plată',
      'Your payment history will appear here.': 'Istoricul tău de plată va apărea aici.',
      'Payment Date': 'Data Plății',
      'Total Amount': 'Suma Totală',
      'Payment Method': 'Metodă de Plată',
      'Credit Card': 'Card de Credit',
      'Debit Card': 'Card de Debit',
      'Bank Transfer': 'Transfer Bancar',
      'Card Number': 'Număr Card',
      'Expiry Date': 'Data Expirării',
      'CVV': 'CVV',
      'Cardholder Name': 'Nume Cardholder',
      'Enter cardholder name': 'Introduceți numele cardholder-ului',
      'Processing...': 'Se procesează...',
      'Process Payment': 'Procesează Plată',
      'My Profile': 'Profilul Meu',
      'Loading profile...': 'Se încarcă profilul...',
      'Profile Settings': 'Setări Profil',
      'Update your personal information and preferences': 'Actualizează informațiile personale și preferințele',
      'Personal Information': 'Informații Personale',
      'First Name': 'Prenume',
      'Last Name': 'Nume',
      'Email Address': 'Adresă Email',
      'Email cannot be changed': 'Adresa de email nu poate fi modificată',
      'Phone Number': 'Număr de Telefon',
      'Address Information': 'Informații Adresă',
      'Street Address': 'Stradă',
      'City': 'Oraș',
      'State/Province': 'Stat/Provincie',
      'ZIP/Postal Code': 'Cod Postal/Cod Poștal',
      'Country': 'Țară',
      'Preferences': 'Preferințe',
      'Timezone': 'Fus orar',
      'Notification Preferences': 'Preferințe Notificări',
      'Email notifications': 'Notificări Email',
      'SMS notifications': 'Notificări SMS',
      'Saving...': 'Se salvează...',
      'Save Changes': 'Salvează Modificări',
      'Loading...': 'Se încarcă...',
      'Loading payments...': 'Se încarcă plățile...',
      'Loading invoices...': 'Se încarcă facturile...',
      'Full Name': 'Nume Complet',
      'Email Address': 'Adresă Email',
      'Password': 'Parolă',
      'Sign Up': 'Înregistrare',
      'Already have an account?': 'Ai deja un cont?',
      'Sign In': 'Conectare',
      'English': 'Engleză',
      'Romanian': 'Română',
      'German': 'Germană',
      'Contact Support': 'Contactează Suportul',
      'Update Profile': 'Actualizează Profilul',
      'View All Invoices': 'Vezi Toate Facturile',
      'Make Payment': 'Efectuează Plată',
      'No description': 'Fără descriere',
      'N/A': 'N/A',
      'Client Portal Registration': 'Înregistrare Portal Client',
      'Sign up to access your invoices, payment history, and update your profile.': 'Înregistrează-te pentru a accesa facturile, istoricul plăților și actualizează-ți profilul.',
      'Create Your Client Account': 'Creează-ți Contul de Client',
      'Already have a client account?': 'Ai deja un cont de client?',
      'Log In': 'Conectare'
    }
  },
  de: {
    translation: {
      'Dashboard': 'Übersicht',
      'Clients': 'Kunden',
      'Invoices': 'Rechnungen',
      'Reports': 'Berichte',
      'Settings': 'Einstellungen',
      'Logout': 'Abmelden',
      'Client Management': 'Kundenverwaltung',
      'Add, view, and organize your client information.': 'Fügen Sie Kunden hinzu, sehen Sie sie an und organisieren Sie deren Informationen.',
      'Invoice Creation': 'Rechnungserstellung',
      'Create and customize professional invoices in minutes.': 'Erstellen und gestalten Sie professionelle Rechnungen in wenigen Minuten.',
      'Invoice List & Status': 'Rechnungsliste & Status',
      'Track the status of all your invoices, from sent to paid.': 'Verfolgen Sie den Status aller Rechnungen, von gesendet bis bezahlt.',
      'PDF Generation': 'PDF-Erstellung',
      'Generate and download PDF versions of your invoices.': 'Erstellen und laden Sie PDF-Versionen Ihrer Rechnungen herunter.',
      'SettingsTitle': 'Einstellungen',
      'SettingsDesc': 'Passen Sie Ihre Sprache und das Design an.',
      'Language': 'Sprache',
      'Theme': 'Design',
      'Light': 'Hell',
      'Dark': 'Dunkel',
      'System Default': 'Systemstandard',
      'Export CSV': 'CSV exportieren',
      'From:': 'Von:',
      'To:': 'Bis:',
      'Total Revenue': 'Gesamteinnahmen',
      'Outstanding': 'Offen',
      'Total Invoices': 'Gesamtrechnungen',
      'Total Tax Collected': 'Gesamteingezogene Steuer',
      'Name': 'Name',
      'Email': 'E-Mail',
      'Company': 'Firma',
      'Phone': 'Telefon',
      'Actions': 'Aktionen',
      'Add Client': 'Kunde hinzufügen',
      'Update Client': 'Kunde aktualisieren',
      'Cancel': 'Abbrechen',
      'No clients found.': 'Keine Kunden gefunden.',
      'Loading...': 'Wird geladen...',
      'DashboardDesc': 'Dies ist Ihr zentrales Dashboard für die Verwaltung aller Rechnungs- und Kundenanforderungen. Hier können Sie neue Rechnungen erstellen, Ihre Kundenliste verwalten und den Status aller Finanzdokumente einsehen.',
      'Total Amount': 'Gesamtbetrag',
      'Overdue': 'Überfällig',
      'InvoiceApp': 'RechnungsApp',
      'English': 'Englisch',
      'Romanian': 'Rumänisch',
      'German': 'Deutsch',
      'of the interface (where translations are available).': 'der Oberfläche (wo Übersetzungen verfügbar sind).',
      'of the website.': 'der Webseite.',
      'Client Portal': 'Kundenportal',
      'Welcome': 'Willkommen',
      'Total Invoices': 'Gesamtrechnungen',
      'Outstanding Balance': 'Offener Betrag',
      'Paid Invoices': 'Bezahlte Rechnungen',
      'Overdue Invoices': 'Überfällige Rechnungen',
      'Recent Invoices': 'Aktuelle Rechnungen',
      'View All': 'Alle anzeigen',
      'No invoices found.': 'Keine Rechnungen gefunden.',
      'Invoice': 'Rechnung',
      'View': 'Anzeigen',
      'Quick Actions': 'Schnellaktionen',
      'View All Invoices': 'Alle Rechnungen anzeigen',
      'Make Payment': 'Zahlung leisten',
      'Update Profile': 'Profil aktualisieren',
      'Contact Support': 'Support kontaktieren',
      'Client': 'Kunde',
      'Date': 'Datum',
      'Due Date': 'Fälligkeitsdatum',
      'Status': 'Status',
      'Currency': 'Währung',
      'Line Items': 'Positionen',
      'Qty': 'Menge',
      'Price': 'Preis',
      'Tax': 'Steuer',
      'Subtotal': 'Zwischensumme',
      'Discount': 'Rabatt',
      'Total': 'Gesamt',
      'My Invoices': 'Meine Rechnungen',
      'Back to Dashboard': 'Zurück zum Dashboard',
      'Invoice History': 'Rechnungsverlauf',
      'View and manage all your invoices': 'Alle Rechnungen anzeigen und verwalten',
      'Search invoices...': 'Rechnungen suchen...',
      'All Status': 'Alle Status',
      'Pending': 'Ausstehend',
      'Paid': 'Bezahlt',
      'Overdue': 'Überfällig',
      'completed': 'Abgeschlossen',
      'No invoices found': 'Keine Rechnungen gefunden',
      'Try adjusting your search or filters': 'Versuchen Sie, Ihre Suche oder Filter anzupassen',
      'You don\'t have any invoices yet': 'Sie haben noch keine Rechnungen',
      'Invoice #': 'Rechnungsnummer',
      'Date/Paid Date': 'Datum/Zahlungsdatum',
      'Amount': 'Betrag',
      'Actions': 'Aktionen',
      'View': 'Anzeigen',
      'Download': 'Herunterladen',
      'Payments': 'Zahlungen',
      'invoices pending': 'ausstehende Rechnungen',
      'Total Paid': 'Gesamtbezahlt',
      'payments made': 'Zahlungen vorgenommen',
      'Last Payment': 'Letzte Zahlung',
      'No payments yet': 'Noch keine Zahlungen',
      'Outstanding Invoices': 'Ausstehende Rechnungen',
      'Make payments on your pending invoices': 'Zahlen Sie Ihre ausstehenden Rechnungen',
      'All caught up!': 'Alles auf dem Laufenden!',
      'You have no outstanding invoices.': 'Sie haben keine ausstehenden Rechnungen.',
      'Due': 'Fällig',
      'Pay Now': 'Jetzt bezahlen',
      'Payment History': 'Zahlungsverlauf',
      'View your past payment transactions': 'Sehen Sie Ihre Zahlungsverlauf',
      'No payment history': 'Kein Zahlungsverlauf',
      'Your payment history will appear here.': 'Ihr Zahlungsverlauf wird hier erscheinen.',
      'Payment Date': 'Zahlungsdatum',
      'Total Amount': 'Gesamtbetrag',
      'Payment Method': 'Zahlungsmethode',
      'Credit Card': 'Kreditkarte',
      'Debit Card': 'Debitkarte',
      'Bank Transfer': 'Banküberweisung',
      'Card Number': 'Kartennummer',
      'Expiry Date': 'Ablaufdatum',
      'CVV': 'CVV',
      'Cardholder Name': 'Karteninhaber',
      'Enter cardholder name': 'Geben Sie den Karteninhaber ein',
      'Processing...': 'Wird verarbeitet...',
      'Process Payment': 'Zahlung verarbeiten',
      'My Profile': 'Mein Profil',
      'Loading profile...': 'Profil wird geladen...',
      'Profile Settings': 'Profil-Einstellungen',
      'Update your personal information and preferences': 'Aktualisieren Sie Ihre persönlichen Informationen und Einstellungen',
      'Personal Information': 'Persönliche Informationen',
      'First Name': 'Vorname',
      'Last Name': 'Nachname',
      'Email Address': 'E-Mail-Adresse',
      'Email cannot be changed': 'E-Mail-Adresse kann nicht geändert werden',
      'Phone Number': 'Telefonnummer',
      'Address Information': 'Adressinformationen',
      'Street Address': 'Straße',
      'City': 'Stadt',
      'State/Province': 'Bundesland/Provinz',
      'ZIP/Postal Code': 'Postleitzahl/Postleitzahl',
      'Country': 'Land',
      'Preferences': 'Einstellungen',
      'Timezone': 'Zeitzone',
      'Notification Preferences': 'Benachrichtigungseinstellungen',
      'Email notifications': 'E-Mail-Benachrichtigungen',
      'SMS notifications': 'SMS-Benachrichtigungen',
      'Saving...': 'Wird gespeichert...',
      'Save Changes': 'Änderungen speichern',
      'Loading...': 'Wird geladen...',
      'Loading payments...': 'Zahlungen werden geladen...',
      'Loading invoices...': 'Rechnungen werden geladen...',
      'Full Name': 'Vollständiger Name',
      'Email Address': 'E-Mail-Adresse',
      'Password': 'Passwort',
      'Sign Up': 'Registrieren',
      'Already have an account?': 'Haben Sie bereits ein Konto?',
      'Sign In': 'Anmelden',
      'English': 'Englisch',
      'Romanian': 'Rumänisch',
      'German': 'Deutsch',
      'Contact Support': 'Support kontaktieren',
      'Update Profile': 'Profil aktualisieren',
      'View All Invoices': 'Alle Rechnungen anzeigen',
      'Make Payment': 'Zahlung vornehmen',
      'No description': 'Keine Beschreibung',
      'N/A': 'N/A',
      'Client Portal Registration': 'Client-Portal Registrierung',
      'Sign up to access your invoices, payment history, and update your profile.': 'Registrieren Sie sich, um auf Ihre Rechnungen, Zahlungsverlauf und Profilaktualisierung zuzugreifen.',
      'Create Your Client Account': 'Erstellen Sie Ihr Client-Konto',
      'Already have a client account?': 'Haben Sie bereits ein Client-Konto?',
      'Log In': 'Anmelden'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 