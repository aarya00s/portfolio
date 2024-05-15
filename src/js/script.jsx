import React, { useEffect } from 'react';
import Experience from './Experience/Experience.js';
import * as THREE from 'three';

const ScriptComponent = () => {
    useEffect(() => {
        // Initialize the experience
        const experience = new Experience({
            targetElement: document.querySelector('.experience')
        });

        let boatMovement = false;
        let shouldFollow = true;
        let Mpressed = false;
        let automaticMovement = true;
        let animationFrameId;
        let intervalId;
        // Function to handle mouse movement
        function handleMouseMove(event) {
            if (!experience.world.ocean && !experience.world.wagon) return;
            if (automaticMovement) {
                experience.camera.setMode('follow');
                experience.camera.setFollowTarget(experience.world.wagon.models.boat);
            } if (experience.world.ocean.parameters.automaticMovement !== automaticMovement) {
                if (!experience.world.ocean.parameters.automaticMovement && automaticMovement) {
                    const currentPosition = new THREE.Vector3().copy(experience.world.wagon.models.boat.position);
                    currentPosition.z += 10;
                    currentPosition.y += 2;
                    experience.camera.modes.debug.orbitControls.target.copy(currentPosition);
                    experience.camera.modes.debug.orbitControls.update();
                    experience.camera.setMode('debug');
                }
            }
            experience.world.wagon.isFreeMoving = experience.world.ocean.parameters.isFreeMoving

            const boatMovementChanged = experience.world.ocean.parameters.boatMovement !== boatMovement;
            const automaticMovementChanged = experience.world.ocean.parameters.automaticMovement !== automaticMovement;

            boatMovement = experience.world.ocean.parameters.boatMovement;
            automaticMovement = experience.world.ocean.parameters.automaticMovement;

            let movementY = 0;

            if (boatMovementChanged) {
                document.dispatchEvent(new CustomEvent('MoveBoat', { detail: { event: event } }));
                const currentPosition = new THREE.Vector3().copy(experience.world.wagon.models.boat.position);
                currentPosition.z += 10;
                currentPosition.y += 2;
                experience.camera.modes.debug.orbitControls.target.copy(currentPosition);
                experience.camera.modes.debug.orbitControls.update();
                experience.camera.setMode('debug');
            }

            if (boatMovement) {
                document.dispatchEvent(new CustomEvent('movetheboat', { detail: { event: event } }));
            }
            if (Mpressed) {
                document.dispatchEvent(new CustomEvent('movetheboat', { detail: { event: event } }));
            }
        }

        function moveBoat() {
            if (automaticMovement && experience.world.wagon) {
                experience.world.wagon.boatProgress += 0.00006; // Adjust the speed as necessary
                experience.world.wagon.update();
            }
            animationFrameId = requestAnimationFrame(moveBoat);
        }

        // Function to toggle camera follow mode
        function toggleFollowMode(event) {
            if (event.key === 'm' || event.key === 'M') {
                shouldFollow = !shouldFollow;
                if (shouldFollow) {
                    experience.camera.setMode('follow');
                    experience.camera.setFollowTarget(experience.world.wagon.models.boat);
                } else {
                    const currentPosition = new THREE.Vector3().copy(experience.world.wagon.models.boat.position);
                    currentPosition.z += 10;
                    currentPosition.y += 2;
                    experience.camera.modes.debug.orbitControls.target.copy(currentPosition);
                    experience.camera.modes.debug.orbitControls.update();
                    experience.camera.setMode('debug');
                }

                if (experience.world.wagon.models.boat) {
                    experience.world.wagon.update();
                }
            }
        }

        let joystick = null; // Keep a reference to the joystick
        function toggleMPressed(Mpressed) {
            Mpressed = !Mpressed;
            toggleJoystick(Mpressed);
        }

        function toggleJoystick(event) {
            var size = 150;
            if (window.innerWidth < 600) {
                size = 100;
            }

            var sampleJoystick = {
                zone: document.getElementById("text-panel"),
                mode: 'dynamic',
                position: {
                    left: '50%',
                    top: '50%'
                },
                size: size,
                color: 'rgba(0, 0, 0, 0.1)' // Set a light color with reduced opacity
            };

            if (joystick) {
                joystick.destroy();
                joystick = null;
            }

            joystick = nipplejs.create(sampleJoystick);

            joystick.on('move', function (evt, data) {
                experience.camera.setMode('follow');
                experience.camera.setFollowTarget(experience.world.wagon.models.boat);
                if (!data.direction) return;

                let deltaX = 0, deltaZ = 0;
                var maxSpeed = 0.0002;

                switch (data.direction.angle) {
                    case 'up': deltaZ = maxSpeed; break;
                    case 'down': deltaZ = -maxSpeed; break;
                    case 'left': deltaX = -maxSpeed; break;
                    case 'right': deltaX = maxSpeed; break;
                    default: break;
                }

                experience.world.wagon.boatProgress += deltaZ;
                experience.world.wagon.horizontalProgress += deltaX;
                experience.world.wagon.verticalProgress += deltaZ;

                experience.world.wagon.update();
            });
        }
        intervalId = setInterval(handleMouseMove, 1000);
        // Attach event listeners
        // document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('click', toggleJoystick);
        document.addEventListener('MoveBoat', toggleFollowMode);
        document.addEventListener('keypress', toggleFollowMode);

        // Start the automatic boat movement
        moveBoat();

        // Cleanup function
        return () => {
            clearInterval(intervalId);
            cancelAnimationFrame(animationFrameId);
            // document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('click', toggleJoystick);
            document.removeEventListener('movetheboat', toggleJoystick);
            document.removeEventListener('MoveBoat', toggleFollowMode);
            document.removeEventListener('keypress', toggleFollowMode);
        };
    }, []);

    return null; // This component does not render anything to the DOM itself
};

export default ScriptComponent;
