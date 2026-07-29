import { ClubRepository } from '@/src/repositories/ClubRepository';
import { UserRepository } from '@/src/repositories/UserRepository';
import { recordSupermatch } from '@/src/services/SupermatchService';
import { recordTournament } from '@/src/services/TournamentService';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  useEffect(() => {
    async function testServices() {
      try {
        const club = await ClubRepository.create({
          name: 'Armbrydning 5000',
          location: 'Odense',
        });

        const playerA = await UserRepository.create({
          name: 'Spiller A',
          username: `spillerA-${Date.now()}`,
          clubId: club.id,
          roles: ['member'],
          status: 'active',
          rating: 1200,
          weight: 80,
          height: 180,
          birthDate: '1995-05-15',
          gender: 'male',
          consentDate: new Date().toISOString(),
        });

        const playerB = await UserRepository.create({
          name: 'Spiller B',
          username: `spillerB-${Date.now()}`,
          clubId: club.id,
          roles: ['member'],
          status: 'active',
          rating: 1200,
          weight: 85,
          height: 182,
          birthDate: '1993-03-10',
          gender: 'male',
          consentDate: new Date().toISOString(),
        });

        const playerC = await UserRepository.create({
          name: 'Spiller C',
          username: `spillerC-${Date.now()}`,
          clubId: club.id,
          roles: ['member'],
          status: 'active',
          rating: 1100,
          weight: 75,
          height: 175,
          birthDate: '1998-07-20',
          gender: 'male',
          consentDate: new Date().toISOString(),
        });

        console.log('Spillere oprettet:', playerA.name, playerA.rating, '|', playerB.name, playerB.rating, '|', playerC.name, playerC.rating);

        const tournament = await recordTournament(
          'Odense Open',
          new Date().toISOString(),
          club.id,
          playerA.id,
          [
            { userId: playerA.id, placement: 1 },
            { userId: playerB.id, placement: 2 },
            { userId: playerC.id, placement: 3 },
          ]
        );
        console.log('Turnering registreret:', tournament.name);

        const updatedA = await UserRepository.getById(playerA.id);
        const updatedB = await UserRepository.getById(playerB.id);
        const updatedC = await UserRepository.getById(playerC.id);
        console.log(
          'Ratings efter turnering:',
          updatedA?.name, updatedA?.rating, '|',
          updatedB?.name, updatedB?.rating, '|',
          updatedC?.name, updatedC?.rating
        );

        const supermatch = await recordSupermatch(
          playerA.id,
          playerB.id,
          new Date().toISOString(),
          'best_of_7',
          club.id,
          playerA.id,
          ['A', 'B', 'A', 'A', 'B', 'A']
        );
        console.log('Supermatch registreret:', supermatch.id);

        const finalA = await UserRepository.getById(playerA.id);
        const finalB = await UserRepository.getById(playerB.id);
        console.log('Ratings efter supermatch:', finalA?.name, finalA?.rating, '|', finalB?.name, finalB?.rating);
      } catch (error) {
        console.error('Fejl ved test af services:', error);
      }
    }
    testServices();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Test kører — tjek terminalen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});