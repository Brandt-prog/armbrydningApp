import { ScrollView, StyleSheet, Text } from 'react-native'
import { colors, fonts, spacing } from '../theme/theme'

export function HowRankingWorksContent() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Sådan virker ranglisten</Text>

      <Text style={styles.heading}>To ratings — ét per arm</Text>
      <Text style={styles.body}>
        Du har to separate tal: ét for højre arm, ét for venstre. Hvert tal har to dele — selve rating-tallet, og et usikkerhedsmål (±), der viser, hvor sikre vi er på tallet. En ny spiller starter på 1500 ±350. Jo flere kampe, jo mere præcist bliver tallet.
      </Text>

      <Text style={styles.heading}>Hver kamp opdaterer med det samme</Text>
      <Text style={styles.body}>
        Vinder du en kamp, du var forventet at vinde, stiger dit tal kun lidt. Vinder du uventet over en stærkere modstander, stiger det meget. Det gør systemet retfærdigt uden faste pointtabeller.
      </Text>

      <Text style={styles.heading}>Kun køn er en fast opdeling</Text>
      <Text style={styles.body}>
        Vægt og alder bruges kun til at vise og filtrere ranglisten — ikke i selve beregningen. Det betyder, at du beholder dit tal, selvom din vægt eller aldersgruppe ændrer sig over tid.
      </Text>

      <Text style={styles.heading}>"Ikke nok data endnu"</Text>
      <Text style={styles.body}>
        For at stå på selve topranglisten skal to ting være opfyldt: dit tal skal være nogenlunde sikkert (lav usikkerhed), og du skal have spillet mod en tilstrækkeligt bred gruppe af modstandere — ikke kun den samme person igen og igen. Mangler du et af de to, vises du i stedet i "Ikke nok data endnu", indtil du har spillet lidt mere.
      </Text>

      <Text style={styles.heading}>"Sammenlignelig" / "Ikke sammenlignelig"</Text>
      <Text style={styles.body}>
        På en spillers profil kan du se, om I to er "sammenlignelige" — altså om der findes en kæde af fælles modstandere mellem jer. Hvis ikke, er forskellen mellem jeres tal ikke nødvendigvis retvisende endnu.
      </Text>

      <Text style={styles.heading}>Er det perfekt?</Text>
      <Text style={styles.body}>
        Nej — og det er helt bevidst. Selv store sportsgrene som MMA løser ikke fuldt ud, hvordan man sammenligner på tværs af vidt forskellige grupper. Ranglisten er et solidt, vejledende værktøj, ikke en absolut facitliste.
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
})