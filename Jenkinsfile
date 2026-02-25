pipeline {
    agent any

    environment {
        GROQ_API_KEY = credentials('groq-api-key')
        GITHUB_CREDENTIALS = credentials('github-token1')
    }

    triggers {
        // Trigger on push to main branch
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Calculate Version') {
            steps {
                script {
                    def currentVersion = sh(
                        script: "grep -oP '## \\[\\K[0-9]+\\.[0-9]+\\.[0-9]+' CHANGELOG.md | head -1 || echo '0.0.0'",
                        returnStdout: true
                    ).trim()

                    if (!currentVersion) currentVersion = '0.0.0'

                    def parts = currentVersion.tokenize('.')
                    def major = parts[0].toInteger()
                    def minor = parts[1].toInteger()
                    def patch = parts[2].toInteger()

                    def prTitle = env.CHANGE_TITLE ?: sh(script: "git log -1 --pretty=%s", returnStdout: true).trim()

                    if (prTitle =~ /^(BREAKING|breaking|!)/) {
                        major++; minor = 0; patch = 0
                    } else if (prTitle =~ /^(feat|feature|Feat|Feature)/) {
                        minor++; patch = 0
                    } else {
                        patch++
                    }

                    env.NEW_VERSION = "${major}.${minor}.${patch}"
                    env.PR_TITLE = prTitle
                    echo "New version: ${env.NEW_VERSION}"
                }
            }
        }

        stage('Generate Changelog') {
            steps {
                script {
                    def prAuthor = env.CHANGE_AUTHOR ?: sh(script: "git log -1 --pretty=%an", returnStdout: true).trim()
                    def prNumber = env.CHANGE_ID ?: '0'
                    def date = sh(script: "date +'%Y-%m-%d'", returnStdout: true).trim()

                    // Try AI generation with Groq, fall back to PR title
                    def entry = env.PR_TITLE
                    try {
                        sh """
                            python3 generate_changelog.py --ci || true
                        """
                    } catch (e) {
                        echo "AI generation failed, using PR title as fallback"
                    }

                    // Update CHANGELOG.md using Python to safely handle special characters
                    writeFile file: 'update_changelog.py', text: """
import os, re
from datetime import datetime

version = '${env.NEW_VERSION}'
author = '${prAuthor}'
pr_number = '${prNumber}'
pr_title = '''${env.PR_TITLE}'''
date = '${date}'

with open('CHANGELOG.md', 'r') as f:
    content = f.read()

content = re.sub(r'(## \\\\[Unreleased\\\\].*?)(^- .+\$\\\\n?)+', r'\\\\1', content, flags=re.MULTILINE)

match = re.search(r'^## \\\\[Unreleased\\\\].*\$', content, re.MULTILINE)
if match:
    insert_pos = match.end()
    new_entry = f'\\\\n\\\\n## [{version}] - {date}\\\\n\\\\n- {pr_title} (#{pr_number}) by @{author}\\\\n'
    content = content[:insert_pos] + new_entry + content[insert_pos:]

with open('CHANGELOG.md', 'w') as f:
    f.write(content)

print('Updated CHANGELOG.md:')
print(content[:1500])
"""
                    sh 'python3 update_changelog.py'
                    sh 'rm -f update_changelog.py'
                }
            }
        }

        stage('Commit Changelog') {
            steps {
                script {
                    sh """
                        git config user.name "jenkins-bot"
                        git config user.email "jenkins@amdocs.com"

                        if ! git diff --quiet CHANGELOG.md; then
                            git add CHANGELOG.md
                            git commit -m "docs: release v${env.NEW_VERSION} - changelog update"
                            git push origin HEAD
                            echo "Changelog committed and pushed"
                        else
                            echo "No changelog changes to commit"
                        fi
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Changelog updated successfully for version ${env.NEW_VERSION}"
        }
        failure {
            echo "Pipeline failed - check logs above"
        }
    }
}
