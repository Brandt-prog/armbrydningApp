import { ScrollView, StyleSheet, Text } from 'react-native'
import { colors, fonts, spacing } from '../theme/theme'

export function PrivacyPolicyContent() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sådan behandler Armbrydning 5000 dine oplysninger</Text>

      <Text style={styles.heading}>Hvem er ansvarlig?</Text>
      <Text style={styles.body}>
        Armbrydning 5000 er dataansvarlig for de oplysninger, der behandles i denne app. Har du spørgsmål, kan du kontakte os på kontakt@armbrydning5000.dk.
      </Text>

      <Text style={styles.heading}>Hvilke oplysninger indsamler vi?</Text>
      <Text style={styles.bullet}>• Navn og brugernavn</Text>
      <Text style={styles.bullet}>• Klub-tilhørsforhold</Text>
      <Text style={styles.bullet}>• Fødselsdato, køn</Text>
      <Text style={styles.bullet}>• Vægt og højde (valgfrit, kan altid rettes)</Text>
      <Text style={styles.bullet}>• Rating og kamphistorik</Text>

      <Text style={styles.heading}>Hvorfor indsamler vi det?</Text>
      <Text style={styles.body}>
        Navn, brugernavn og klub bruges til at administrere dit medlemskab og vise dig korrekt på ranglisten. Fødselsdato, køn og vægt bruges til at beregne din alders- og vægtklasse, samt til at afgøre, om forældresamtykke er nødvendigt. Rating og kamphistorik er selve formålet med appen.
      </Text>

      <Text style={styles.heading}>Mindreårige medlemmer</Text>
      <Text style={styles.body}>
        Er du under 18 år, kræver oprettelse af en profil samtykke fra en forælder eller værge. Dette bekræftes ved profil-oprettelse. Forælder eller værge kan til enhver tid kontakte os på kontakt@armbrydning5000.dk for at få indsigt i, rette, eller slette et barns oplysninger.
      </Text>

      <Text style={styles.heading}>Hvem har adgang?</Text>
      <Text style={styles.body}>
        Dit navn, klub og rating er synligt for alle medlemmer. Din fødselsdato, vægt og højde er kun synlig for klubbens administratorer.
      </Text>

      <Text style={styles.heading}>Hvor lang tid gemmer vi det?</Text>
      <Text style={styles.body}>
        Så længe du er aktivt medlem. Ved udmeldelse slettes dine personlige oplysninger senest 6 måneder efter, medmindre du beder om det før.
      </Text>

      <Text style={styles.heading}>Hvem behandler dataen for os?</Text>
      <Text style={styles.body}>
        Appens data opbevares hos Supabase (databaseudbyder inden for EU), som fungerer som vores databehandler.
      </Text>

      <Text style={styles.heading}>Dine rettigheder</Text>
      <Text style={styles.body}>
        Du kan altid se og rette dine oplysninger via "Rediger profil", eller bede om at få dem slettet ved at kontakte os på kontakt@armbrydning5000.dk.
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 20, fontFamily: fonts.display, color: colors.ink, marginBottom: spacing.lg },
  heading: { fontSize: 13, fontFamily: fonts.displayMedium, color: colors.primary, marginTop: spacing.lg, marginBottom: spacing.xs },
  body: { fontSize: 14, color: colors.ink, lineHeight: 20 },
  bullet: { fontSize: 14, color: colors.ink, lineHeight: 22, marginLeft: spacing.xs },
})