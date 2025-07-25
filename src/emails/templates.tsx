import { EmailData } from "@/types/global"
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"
const EmailTemplate = ({
  username = "",
  type = "budget-alert",
  data = {} as EmailData,
}) => {
  if (type === "monthly-report") {
    return (
      <Html>
        <Head />
        <Preview>Your Monthly Financial Report</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Monthly Financial Report</Heading>

            <Text style={styles.text}>Hello {username},</Text>
            <Text style={styles.text}>
              Here&rsquo;s your financial summary for {data?.month}:
            </Text>

            {/* Main Stats */}
            <Section style={styles.statsContainer}>
              {data.stats && (
                <>
                  <div style={styles.stat}>
                    <Text style={styles.text}>Total Income</Text>
                    <Text style={styles.heading}>
                      ${data.stats.totalIncome}
                    </Text>
                  </div>
                  <div style={styles.stat}>
                    <Text style={styles.text}>Total Expenses</Text>
                    <Text style={styles.heading}>
                      ${data.stats.totalExpenses}
                    </Text>
                  </div>
                  <div style={styles.stat}>
                    <Text style={styles.text}>Net</Text>
                    <Text style={styles.heading}>
                      ${data.stats.totalIncome - data?.stats.totalExpenses}
                    </Text>
                  </div>
                </>
              )}
            </Section>

            {/* Category Breakdown */}
            {data?.stats?.byCategory && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Expenses by Category</Heading>
                {Object.entries(data?.stats.byCategory).map(
                  ([category, amount]) => (
                    <div key={category} style={styles.row}>
                      <Text style={styles.text}>{category}</Text>
                      <Text style={styles.text}>${amount as number}</Text>
                    </div>
                  )
                )}
              </Section>
            )}

            {/* AI Insights */}
            {data?.insights && (
              <Section style={styles.section}>
                <Heading style={styles.heading}>Rakam Insights</Heading>
                {data.insights.map((insight: string, index: number) => (
                  <Text key={index} style={styles.text}>
                    • {insight}
                  </Text>
                ))}
              </Section>
            )}

            <Text style={styles.footer}>
              Thank you for using Rakam AI. Keep tracking your finances for
              better financial health!
            </Text>
          </Container>
        </Body>
      </Html>
    )
  }

  if (type === "budget-alert") {
    return (
      <Html>
        <Head />
        <Preview>Budget Alert</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>Hello {username}</Text>
            <Text style={styles.text}>
              You&rsquo;ve used {data?.percentageUsed!.toFixed(1)}% of your
              monthly budget.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Budget Amount</Text>
                <Text style={styles.heading}>${data?.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Spent So Far</Text>
                <Text style={styles.heading}>${data?.totalExpenses}</Text>
              </div>
              {data?.budgetAmount !== undefined &&
                data?.totalExpenses !== undefined && (
                  <div style={styles.stat}>
                    <Text style={styles.text}>Remaining</Text>
                    <Text style={styles.heading}>
                      ${data.budgetAmount - data.totalExpenses}
                    </Text>
                  </div>
                )}
            </Section>
          </Container>
        </Body>
      </Html>
    )
  }
}

export default EmailTemplate

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    // textAlign: "center",
    margin: "0 0 20px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 16px",
  },
  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#ffffff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  section: {
    marginTop: "32px",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
    border: "1px solid #e5e7eb",
  },
  heading: {
    color: "#1f2937",
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 16px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  footer: {
    color: "#6b7280",
    fontSize: "14px",
    // textAlign: "center",
    marginTop: "32px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  },
}
